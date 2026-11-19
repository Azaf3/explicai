import { describe, expect, it } from 'vitest'
import { concepts } from '../data/concepts'
import { buildSystemPrompt, parseReviewJson } from './review'
import { rawReview } from './testUtils'

const concept = concepts.find((c) => c.id === 'react')!

describe('buildSystemPrompt', () => {
  it('inclui a pergunta, os pontos de referência e as confusões comuns do conceito', () => {
    const prompt = buildSystemPrompt(concept)
    expect(prompt).toContain(concept.prompt)
    for (const point of concept.keyPoints) expect(prompt).toContain(point)
    for (const mistake of concept.commonMistakes) expect(prompt).toContain(mistake)
  })
})

describe('parseReviewJson', () => {
  it('converte o JSON da IA para o formato do app', () => {
    expect(parseReviewJson(JSON.stringify(rawReview))).toEqual({
      verdict: 'quase',
      summary: 'Boa base.',
      correct: ['Componentes como peças.'],
      adjustments: [{ excerpt: 'framework', issue: 'É biblioteca.', suggestion: 'biblioteca' }],
      questions: ['O que faz renderizar de novo?'],
      revised: 'React é uma biblioteca...',
    })
  })

  it('aceita o veredito com maiúscula diferente', () => {
    expect(parseReviewJson(JSON.stringify({ ...rawReview, veredito: 'Firme' })).verdict).toBe('firme')
  })

  it.each([undefined, '', 'não é json', JSON.stringify({ ...rawReview, veredito: 'talvez' })])(
    'recusa resposta inválida (%#)',
    (text) => {
      expect(() => parseReviewJson(text)).toThrow(expect.objectContaining({ kind: 'invalid' }))
    },
  )
})
