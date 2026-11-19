import { requestAnthropicReview } from './anthropic'
import { requestGeminiReview } from './gemini'
import type { ProviderId, ProviderRequest, Review } from './review'

export interface ReviewRequest extends ProviderRequest {
  provider: ProviderId
}

export function requestReview({ provider, ...request }: ReviewRequest): Promise<Review> {
  return provider === 'anthropic' ? requestAnthropicReview(request) : requestGeminiReview(request)
}
