import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MIN_EXPLANATION_LENGTH, MODELS, ReviewError, requestReview, type Review } from '../ai/review'
import ReviewView, { VerdictBadge } from '../components/ReviewView'
import { findConcept } from '../data/concepts'
import { findDemo } from '../data/demo'
import { attempts, settings, type Attempt } from '../storage'
import { formatDateTime } from '../utils/format'

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; review: Review; isDemo: boolean }

// A key faz o estado zerar quando a pessoa navega de um conceito para outro.
export default function ConceptPage() {
  const { id } = useParams()
  return <ConceptView key={id} id={id} />
}

function ConceptView({ id }: { id: string | undefined }) {
  const concept = findConcept(id)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [history, setHistory] = useState<Attempt[]>(() => (concept ? attempts.forConcept(concept.id) : []))
  const abortRef = useRef<AbortController | null>(null)

  // Cancela a requisição se a pessoa sair da página no meio.
  useEffect(() => () => abortRef.current?.abort(), [])

  if (!concept) {
    return (
      <section className="empty">
        <h1>Conceito não encontrado</h1>
        <Link to="/">Voltar para os conceitos</Link>
      </section>
    )
  }

  const apiKey = settings.getApiKey()
  const model = settings.getModel()
  const demo = findDemo(concept.id)
  const tooShort = text.trim().length < MIN_EXPLANATION_LENGTH
  const loading = status.kind === 'loading'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!concept || tooShort || !apiKey) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus({ kind: 'loading' })

    try {
      const review = await requestReview({
        apiKey,
        model,
        concept,
        explanation: text,
        signal: controller.signal,
      })
      attempts.add({ conceptId: concept.id, explanation: text.trim(), review, source: model })
      setHistory(attempts.forConcept(concept.id))
      setStatus({ kind: 'done', review, isDemo: false })
    } catch (error) {
      if (controller.signal.aborted) return
      const message = error instanceof ReviewError ? error.message : 'Algo deu errado. Tente de novo.'
      setStatus({ kind: 'error', message })
    }
  }

  function showDemo() {
    if (!demo) return
    setText(demo.explanation)
    setStatus({ kind: 'done', review: demo.review, isDemo: true })
  }

  const modelLabel = MODELS.find((m) => m.id === model)?.label

  return (
    <article className="concept">
      <Link to="/" className="back">
        ← Conceitos
      </Link>
      <p className="eyebrow">{concept.area}</p>
      <h1>{concept.title}</h1>
      <p className="lead">{concept.prompt}</p>

      <form onSubmit={handleSubmit} className="explain-form">
        <label htmlFor="explanation">Explica aí, com as suas palavras</label>
        <textarea
          id="explanation"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Escreva como se estivesse explicando pra um colega. Pode usar analogias, exemplos do seu projeto, do jeito que você pensa."
          disabled={loading}
        />
        <div className="form-row">
          <span className="counter">
            {tooShort
              ? `Escreva pelo menos ${MIN_EXPLANATION_LENGTH} caracteres (${text.trim().length})`
              : `${text.trim().length} caracteres`}
          </span>
          {apiKey ? (
            <button type="submit" className="button" disabled={tooShort || loading}>
              {loading ? 'Corrigindo…' : 'Pedir correção'}
            </button>
          ) : null}
        </div>

        {apiKey ? (
          <p className="muted small">Usando {modelLabel} com a sua chave.</p>
        ) : (
          <div className="notice" role="note">
            <p>
              Para a IA corrigir o seu texto, cadastre sua chave da API da Anthropic em{' '}
              <Link to="/configuracoes">Configurações</Link>. Ela fica só neste navegador.
            </p>
            {demo ? (
              <button type="button" className="button button-ghost" onClick={showDemo}>
                Ver um exemplo pronto
              </button>
            ) : (
              <p className="muted small">
                Os exemplos prontos estão em <Link to="/conceito/react">React</Link>,{' '}
                <Link to="/conceito/api-rest">API REST</Link> e{' '}
                <Link to="/conceito/useeffect">useEffect</Link>.
              </p>
            )}
          </div>
        )}
      </form>

      {status.kind === 'error' && (
        <p className="error" role="alert">
          {status.message}
        </p>
      )}

      {status.kind === 'done' && (
        <>
          <ReviewView review={status.review} isDemo={status.isDemo} />
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              setStatus({ kind: 'idle' })
              document.getElementById('explanation')?.focus()
            }}
          >
            Reescrever minha explicação
          </button>
        </>
      )}

      <details className="reference">
        <summary>Ver a referência que a IA usa</summary>
        <p className="muted small">Vale tentar explicar primeiro e só depois abrir.</p>
        <h3>Uma explicação completa cobre</h3>
        <ul>
          {concept.keyPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <h3>Confusões comuns</h3>
        <ul>
          {concept.commonMistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </details>

      {history.length > 0 && (
        <section className="history" aria-label="Suas tentativas">
          <h2>Suas tentativas ({history.length})</h2>
          <ol>
            {history.map((a) => (
              <li key={a.id}>
                <details>
                  <summary>
                    <VerdictBadge verdict={a.review.verdict} />
                    <time dateTime={a.createdAt}>{formatDateTime(a.createdAt)}</time>
                  </summary>
                  <blockquote className="original">{a.explanation}</blockquote>
                  <ReviewView review={a.review} />
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      attempts.remove(a.id)
                      setHistory(attempts.forConcept(concept.id))
                    }}
                  >
                    Apagar esta tentativa
                  </button>
                </details>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}
