import { describe, expect, it, vi } from 'vitest'
import { concepts } from '../data/concepts'
import {
  ANTHROPIC_URL,
  ANTHROPIC_VERSION,
  buildAnthropicBody,
  parseAnthropicResponse,
  requestAnthropicReview,
} from './anthropic'
import { rawReview, jsonResponse } from './testUtils'

const concept = concepts.find((c) => c.id === 'react')!

describe('buildAnthropicBody', () => {
  it('pede resposta em JSON Schema e não manda temperature (removido na versão 2026-10-21)', () => {
    const body = buildAnthropicBody(concept, '  minha explicação  ', 'claude-haiku-5-5')
    expect(body.model).toBe('claude-haiku-5-5')
    expect(body.output_config.format.type).toBe('json_schema')
    expect(body).not.toHaveProperty('temperature')
    expect(body.messages[0].content).toContain('<explicacao>\nminha explicação\n</explicacao>')
  })
})

describe('parseAnthropicResponse', () => {
  it('acha o bloco de texto mesmo se vier um bloco de thinking antes', () => {
    const review = parseAnthropicResponse({
      content: [{ type: 'thinking' }, { type: 'text', text: JSON.stringify(rawReview) }],
    })
    expect(review.verdict).toBe('quase')
  })

  it.each([
    [{ stop_reason: 'refusal', content: [] }, 'refusal'],
    [{ stop_reason: 'max_tokens', content: [] }, 'truncated'],
    [{ content: [] }, 'invalid'],
  ])('trata resposta problemática (%#)', (data, kind) => {
    expect(() => parseAnthropicResponse(data)).toThrow(expect.objectContaining({ kind }))
  })
})

describe('requestAnthropicReview', () => {
  it('chama a API com a chave do usuário e os cabeçalhos de acesso pelo navegador', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse({ content: [{ type: 'text', text: JSON.stringify(rawReview) }] }))
    const review = await requestAnthropicReview({
      apiKey: 'sk-ant-teste',
      model: 'claude-sonnet-5-5',
      concept,
      explanation: 'React é tipo um framework...',
      fetchFn,
    })

    expect(review.verdict).toBe('quase')
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe(ANTHROPIC_URL)
    expect(init.headers).toMatchObject({
      'x-api-key': 'sk-ant-teste',
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    })
    expect(JSON.parse(init.body).model).toBe('claude-sonnet-5-5')
  })

  it.each([
    [401, 'auth'],
    [429, 'rate_limit'],
    [529, 'overloaded'],
    [500, 'api'],
  ])('traduz o status %i em um erro claro', async (status, kind) => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'x' } }, status))
    await expect(
      requestAnthropicReview({
        apiKey: 'k',
        model: 'claude-haiku-5-5',
        concept,
        explanation: 'texto',
        fetchFn,
      }),
    ).rejects.toMatchObject({ kind })
  })
})
