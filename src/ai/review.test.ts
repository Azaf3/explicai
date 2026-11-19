import { describe, expect, it, vi } from 'vitest'
import { concepts } from '../data/concepts'
import {
  API_URL,
  API_VERSION,
  ReviewError,
  buildRequestBody,
  buildSystemPrompt,
  parseReview,
  requestReview,
} from './review'

const concept = concepts.find((c) => c.id === 'react')!

const rawReview = {
  veredito: 'quase',
  resumo: 'Boa base.',
  acertos: ['Componentes como peças.'],
  ajustes: [{ trecho: 'framework', problema: 'É biblioteca.', sugestao: 'biblioteca' }],
  perguntas: ['O que faz renderizar de novo?'],
  versao_ajustada: 'React é uma biblioteca...',
}

function apiResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('buildSystemPrompt', () => {
  it('inclui a pergunta, os pontos de referência e as confusões comuns do conceito', () => {
    const prompt = buildSystemPrompt(concept)
    expect(prompt).toContain(concept.prompt)
    for (const point of concept.keyPoints) expect(prompt).toContain(point)
    for (const mistake of concept.commonMistakes) expect(prompt).toContain(mistake)
  })
})

describe('buildRequestBody', () => {
  it('pede resposta em JSON Schema e não manda temperature (removido na versão 2026-10-21)', () => {
    const body = buildRequestBody(concept, '  minha explicação  ', 'claude-haiku-5-5')
    expect(body.model).toBe('claude-haiku-5-5')
    expect(body.output_config.format.type).toBe('json_schema')
    expect(body).not.toHaveProperty('temperature')
    expect(body.messages[0].content).toContain('<explicacao>\nminha explicação\n</explicacao>')
  })
})

describe('parseReview', () => {
  it('converte a resposta da API para o formato do app', () => {
    const review = parseReview({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(rawReview) }],
    })
    expect(review).toEqual({
      verdict: 'quase',
      summary: 'Boa base.',
      correct: ['Componentes como peças.'],
      adjustments: [{ excerpt: 'framework', issue: 'É biblioteca.', suggestion: 'biblioteca' }],
      questions: ['O que faz renderizar de novo?'],
      revised: 'React é uma biblioteca...',
    })
  })

  it('acha o bloco de texto mesmo se vier um bloco de thinking antes', () => {
    const review = parseReview({
      content: [{ type: 'thinking' }, { type: 'text', text: JSON.stringify(rawReview) }],
    })
    expect(review.verdict).toBe('quase')
  })

  it('aceita o veredito com maiúscula diferente', () => {
    const review = parseReview({
      content: [{ type: 'text', text: JSON.stringify({ ...rawReview, veredito: 'Firme' }) }],
    })
    expect(review.verdict).toBe('firme')
  })

  it.each([
    [{ stop_reason: 'refusal', content: [] }, 'refusal'],
    [{ stop_reason: 'max_tokens', content: [] }, 'truncated'],
    [{ content: [] }, 'invalid'],
    [{ content: [{ type: 'text', text: 'não é json' }] }, 'invalid'],
  ])('trata resposta problemática (%#)', (data, kind) => {
    expect(() => parseReview(data)).toThrow(expect.objectContaining({ kind }))
  })
})

describe('requestReview', () => {
  it('chama a API com a chave do usuário e os cabeçalhos de acesso pelo navegador', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(apiResponse({ content: [{ type: 'text', text: JSON.stringify(rawReview) }] }))
    const review = await requestReview({
      apiKey: 'sk-ant-teste',
      model: 'claude-sonnet-5-5',
      concept,
      explanation: 'React é tipo um framework...',
      fetchFn,
    })

    expect(review.verdict).toBe('quase')
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe(API_URL)
    expect(init.headers).toMatchObject({
      'x-api-key': 'sk-ant-teste',
      'anthropic-version': API_VERSION,
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
    const fetchFn = vi.fn().mockResolvedValue(apiResponse({ error: { message: 'x' } }, status))
    await expect(
      requestReview({ apiKey: 'k', model: 'claude-haiku-5-5', concept, explanation: 'texto', fetchFn }),
    ).rejects.toMatchObject({ kind })
  })

  it('avisa quando não consegue conectar', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(
      requestReview({ apiKey: 'k', model: 'claude-haiku-5-5', concept, explanation: 'texto', fetchFn }),
    ).rejects.toBeInstanceOf(ReviewError)
  })
})
