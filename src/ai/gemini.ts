import type { Concept } from '../data/concepts'
import {
  ReviewError,
  buildSystemPrompt,
  buildUserMessage,
  parseReviewJson,
  reviewSchema,
  sendRequest,
  type ProviderRequest,
  type Review,
} from './review'

export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
export const GEMINI_MAX_TOKENS = 8000

export function geminiUrl(model: string): string {
  return `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`
}

/**
 * A doc atual do Gemini mostra o formato da resposta em generationConfig.responseFormat.
 * O formato anterior (responseMimeType + responseJsonSchema) fica como plano B, caso a
 * API recuse o novo para algum modelo.
 */
export type GeminiFormatStyle = 'responseFormat' | 'legacy'

export function buildGeminiBody(
  concept: Concept,
  explanation: string,
  style: GeminiFormatStyle = 'responseFormat',
) {
  const format =
    style === 'responseFormat'
      ? { responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: reviewSchema } } }
      : { responseMimeType: 'application/json', responseJsonSchema: reviewSchema }

  return {
    systemInstruction: { parts: [{ text: buildSystemPrompt(concept) }] },
    contents: [{ role: 'user', parts: [{ text: buildUserMessage(concept, explanation) }] }],
    generationConfig: { maxOutputTokens: GEMINI_MAX_TOKENS, ...format },
  }
}

interface GeminiResponse {
  candidates?: {
    finishReason?: string
    content?: { parts?: { text?: string; thought?: boolean }[] }
  }[]
  promptFeedback?: { blockReason?: string }
  error?: { code?: number; status?: string; message?: string }
}

const BLOCKED_REASONS = ['SAFETY', 'RECITATION', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII', 'OTHER']

export function parseGeminiResponse(data: GeminiResponse): Review {
  if (data.promptFeedback?.blockReason) {
    throw new ReviewError('refusal', 'O Gemini bloqueou esse texto. Tente reescrever a explicação.')
  }
  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new ReviewError('truncated', 'A resposta foi cortada no meio. Tente uma explicação mais curta.')
  }
  if (candidate?.finishReason && BLOCKED_REASONS.includes(candidate.finishReason)) {
    throw new ReviewError('refusal', 'O Gemini não quis avaliar esse texto. Tente reescrever a explicação.')
  }
  // Partes marcadas como thought são o raciocínio do modelo, não a resposta.
  const text = candidate?.content?.parts
    ?.filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join('')
  return parseReviewJson(text)
}

function isFormatFieldError(data: GeminiResponse): boolean {
  return /responseFormat|Unknown name/i.test(data.error?.message ?? '')
}

function errorFromResponse(status: number, data: GeminiResponse): ReviewError {
  const message = data.error?.message ?? ''
  if (status === 401 || status === 403 || /API key/i.test(message)) {
    return new ReviewError('auth', 'A chave do Gemini foi recusada. Confira em Configurações.')
  }
  if (status === 429) {
    return new ReviewError(
      'rate_limit',
      'Limite do nível gratuito do Gemini atingido. Espere um minuto ou troque para o Flash-Lite em Configurações.',
    )
  }
  if (status === 503) {
    return new ReviewError(
      'overloaded',
      'O Gemini está sobrecarregado agora. Tente de novo em alguns segundos.',
    )
  }
  if (status === 404) {
    return new ReviewError(
      'api',
      'Esse modelo do Gemini não está disponível. Escolha outro em Configurações.',
    )
  }
  return new ReviewError('api', message ? `Erro da API: ${message}` : `Erro da API (status ${status}).`)
}

/** Chama a API do Gemini direto do navegador, com a chave do próprio usuário. */
export async function requestGeminiReview({
  apiKey,
  model,
  concept,
  explanation,
  fetchFn = globalThis.fetch,
  signal,
}: ProviderRequest): Promise<Review> {
  const call = (style: GeminiFormatStyle) =>
    sendRequest(fetchFn, geminiUrl(model), {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(buildGeminiBody(concept, explanation, style)),
    })

  let { response, data } = await call('responseFormat')
  if (response.status === 400 && isFormatFieldError(data as GeminiResponse)) {
    ;({ response, data } = await call('legacy'))
  }

  const body = data as GeminiResponse
  if (!response.ok) throw errorFromResponse(response.status, body)
  return parseGeminiResponse(body)
}
