import { describe, expect, it, vi } from 'vitest'
import { concepts } from '../data/concepts'
import { buildGeminiBody, geminiUrl, parseGeminiResponse, requestGeminiReview } from './gemini'
import { jsonResponse, rawReview } from './testUtils'

const concept = concepts.find((c) => c.id === 'react')!
const okBody = {
  candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(rawReview) }] } }],
}

describe('buildGeminiBody', () => {
  it('manda o prompt de sistema, o texto do dev e o schema da resposta', () => {
    const body = buildGeminiBody(concept, ' minha explicação ')
    expect(body.systemInstruction.parts[0].text).toContain(concept.prompt)
    expect(body.contents[0].parts[0].text).toContain('<explicacao>\nminha explicação\n</explicacao>')
    expect(body.generationConfig).toMatchObject({
      responseFormat: { text: { mimeType: 'APPLICATION_JSON' } },
    })
    expect(body.generationConfig).not.toHaveProperty('temperature')
  })

  it('tem um formato alternativo com responseMimeType e responseJsonSchema', () => {
    const body = buildGeminiBody(concept, 'texto', 'legacy')
    expect(body.generationConfig).toMatchObject({ responseMimeType: 'application/json' })
    expect(body.generationConfig).toHaveProperty('responseJsonSchema')
  })
})

describe('parseGeminiResponse', () => {
  it('ignora as partes de raciocínio (thought) e lê o JSON', () => {
    const review = parseGeminiResponse({
      candidates: [
        { content: { parts: [{ text: 'pensando...', thought: true }, { text: JSON.stringify(rawReview) }] } },
      ],
    })
    expect(review.verdict).toBe('quase')
    expect(review.adjustments[0].excerpt).toBe('framework')
  })

  it.each([
    [{ promptFeedback: { blockReason: 'SAFETY' } }, 'refusal'],
    [{ candidates: [{ finishReason: 'SAFETY' }] }, 'refusal'],
    [{ candidates: [{ finishReason: 'MAX_TOKENS' }] }, 'truncated'],
    [{ candidates: [] }, 'invalid'],
  ])('trata resposta problemática (%#)', (data, kind) => {
    expect(() => parseGeminiResponse(data)).toThrow(expect.objectContaining({ kind }))
  })
})

describe('requestGeminiReview', () => {
  it('chama o modelo escolhido com a chave no cabeçalho, não na URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(okBody))
    const review = await requestGeminiReview({
      apiKey: 'AIza-teste',
      model: 'gemini-flash-latest',
      concept,
      explanation: 'texto',
      fetchFn,
    })

    expect(review.verdict).toBe('quase')
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe(geminiUrl('gemini-flash-latest'))
    expect(url).not.toContain('AIza')
    expect(init.headers).toMatchObject({ 'x-goog-api-key': 'AIza-teste' })
  })

  it('tenta o formato alternativo se a API não reconhecer responseFormat', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { error: { message: 'Invalid JSON payload received. Unknown name "responseFormat"' } },
          400,
        ),
      )
      .mockResolvedValueOnce(jsonResponse(okBody))

    await requestGeminiReview({
      apiKey: 'k',
      model: 'gemini-flash-latest',
      concept,
      explanation: 'texto',
      fetchFn,
    })

    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetchFn.mock.calls[1][1].body).generationConfig).toHaveProperty('responseJsonSchema')
  })

  it.each([
    [400, 'API key not valid. Please pass a valid API key.', 'auth'],
    [429, 'Resource has been exhausted', 'rate_limit'],
    [503, 'The model is overloaded', 'overloaded'],
    [404, 'models/x is not found', 'api'],
  ])('traduz o status %i em um erro claro', async (status, message, kind) => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ error: { message } }, status))
    await expect(
      requestGeminiReview({
        apiKey: 'k',
        model: 'gemini-flash-latest',
        concept,
        explanation: 'texto',
        fetchFn,
      }),
    ).rejects.toMatchObject({ kind })
  })
})
