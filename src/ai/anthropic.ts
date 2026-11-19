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

export const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
export const ANTHROPIC_VERSION = '2026-10-21'
export const ANTHROPIC_MAX_TOKENS = 4000

export function buildAnthropicBody(concept: Concept, explanation: string, model: string) {
  return {
    model,
    max_tokens: ANTHROPIC_MAX_TOKENS,
    system: buildSystemPrompt(concept),
    messages: [{ role: 'user', content: buildUserMessage(concept, explanation) }],
    output_config: { format: { type: 'json_schema', schema: reviewSchema } },
  }
}

interface AnthropicResponse {
  stop_reason?: string
  content?: { type: string; text?: string }[]
  error?: { message?: string }
}

export function parseAnthropicResponse(data: AnthropicResponse): Review {
  if (data.stop_reason === 'refusal') {
    throw new ReviewError('refusal', 'A IA não quis avaliar esse texto. Tente reescrever a explicação.')
  }
  if (data.stop_reason === 'max_tokens') {
    throw new ReviewError('truncated', 'A resposta foi cortada no meio. Tente uma explicação mais curta.')
  }
  // Pode vir um bloco de thinking antes; o JSON fica no bloco de texto.
  return parseReviewJson(data.content?.find((block) => block.type === 'text')?.text)
}

function errorFromStatus(status: number, message?: string): ReviewError {
  if (status === 401 || status === 403) {
    return new ReviewError('auth', 'A chave da Anthropic foi recusada. Confira em Configurações.')
  }
  if (status === 429) {
    return new ReviewError(
      'rate_limit',
      'Limite de uso da sua chave atingido. Espere um pouco e tente de novo.',
    )
  }
  if (status === 529) {
    return new ReviewError('overloaded', 'A API está sobrecarregada agora. Tente de novo em alguns segundos.')
  }
  return new ReviewError('api', message ? `Erro da API: ${message}` : `Erro da API (status ${status}).`)
}

/**
 * Chama a API da Anthropic direto do navegador, com a chave do próprio usuário.
 * O cabeçalho anthropic-dangerous-direct-browser-access libera o CORS: o nome é um aviso
 * de que a chave fica visível no navegador. Aqui isso é aceitável porque a chave é de quem está usando.
 */
export async function requestAnthropicReview({
  apiKey,
  model,
  concept,
  explanation,
  fetchFn = globalThis.fetch,
  signal,
}: ProviderRequest): Promise<Review> {
  const { response, data } = await sendRequest(fetchFn, ANTHROPIC_URL, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(buildAnthropicBody(concept, explanation, model)),
  })
  const body = data as AnthropicResponse
  if (!response.ok) throw errorFromStatus(response.status, body.error?.message)
  return parseAnthropicResponse(body)
}
