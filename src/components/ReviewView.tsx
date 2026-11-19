import type { Review, Verdict } from '../ai/review'
import ConceptMap from './ConceptMap'

const VERDICT_LABEL: Record<Verdict, string> = {
  firme: 'Entendeu bem',
  quase: 'Quase lá',
  revisar: 'Vale revisar',
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <span className={`badge badge-${verdict}`}>{VERDICT_LABEL[verdict]}</span>
}

interface Props {
  review: Review
  isDemo?: boolean
}

export default function ReviewView({ review, isDemo }: Props) {
  return (
    <section className="review" aria-label="Correção">
      <div className="review-head">
        <VerdictBadge verdict={review.verdict} />
        {isDemo && <span className="badge badge-demo">Exemplo pronto</span>}
      </div>
      <p className="review-summary">{review.summary}</p>

      {review.correct.length > 0 && (
        <div className="review-block block-correct">
          <h3>O que você acertou</h3>
          <ul>
            {review.correct.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {review.adjustments.length > 0 && (
        <div className="review-block block-adjust">
          <h3>O que ajustar</h3>
          <ul className="adjustments">
            {review.adjustments.map((a) => (
              <li key={a.excerpt}>
                <mark>“{a.excerpt}”</mark>
                <p>{a.issue}</p>
                <p className="suggestion">
                  <span>Tente:</span> {a.suggestion}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.questions.length > 0 && (
        <div className="review-block block-questions">
          <h3>Pra pensar</h3>
          <p className="hint">Tente responder antes de olhar a referência.</p>
          <ul>
            {review.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="review-block block-revised">
        <h3>Seu texto, ajustado</h3>
        <blockquote>{review.revised}</blockquote>
      </div>

      {review.map?.length > 0 && (
        <div className="review-block block-map">
          <h3>Seu texto, em mapa</h3>
          <ConceptMap steps={review.map} />
        </div>
      )}
    </section>
  )
}
