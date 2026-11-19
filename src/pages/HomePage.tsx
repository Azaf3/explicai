import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { VerdictBadge } from '../components/ReviewView'
import { AREAS, concepts, type Area } from '../data/concepts'
import { findDemo } from '../data/demo'
import { attempts } from '../storage'
import { normalize } from '../utils/format'

export default function HomePage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const area = (params.get('area') as Area | null) ?? null

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const all = attempts.all()
  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return concepts.filter(
      (c) =>
        (!area || c.area === area) && (!q || normalize(`${c.title} ${c.summary} ${c.prompt}`).includes(q)),
    )
  }, [query, area])

  return (
    <>
      <section className="hero">
        <h1>
          Explica aí que a IA <em>te ajuda a entender.</em>
        </h1>
        <p className="lead">
          Você escreve como entende um conceito. A IA não dá uma aula pronta: ela parte das suas palavras,
          mostra o que está certo, aponta o que ajustar e faz perguntas pra você chegar no resto.
        </p>
        <ol className="steps">
          <li>
            <strong>Escolha um conceito</strong>
            <span>React, API, JWT, Git…</span>
          </li>
          <li>
            <strong>Explique do seu jeito</strong>
            <span>Com analogias e exemplos seus.</span>
          </li>
          <li>
            <strong>Receba a correção</strong>
            <span>Em cima do seu texto, não no lugar dele.</span>
          </li>
        </ol>
      </section>

      <section aria-label="Conceitos">
        <div className="filters">
          <input
            type="search"
            placeholder="Buscar conceito"
            aria-label="Buscar conceito"
            value={query}
            onChange={(e) => update('q', e.target.value)}
          />
          <div className="chips" role="group" aria-label="Filtrar por área">
            <button type="button" aria-pressed={!area} onClick={() => update('area', null)}>
              Todos
            </button>
            {AREAS.map((a) => (
              <button key={a} type="button" aria-pressed={area === a} onClick={() => update('area', a)}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="muted">Nenhum conceito encontrado.</p>
        ) : (
          <ul className="grid">
            {filtered.map((c) => {
              const mine = all
                .filter((a) => a.conceptId === c.id)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              return (
                <li key={c.id}>
                  <Link to={`/conceito/${c.id}`} className="card">
                    <span className="eyebrow">{c.area}</span>
                    <h2>{c.title}</h2>
                    <p>{c.summary}</p>
                    <span className="card-foot">
                      {mine.length > 0 ? (
                        <>
                          <VerdictBadge verdict={mine[0].review.verdict} />
                          <span className="muted small">
                            {mine.length} {mine.length === 1 ? 'tentativa' : 'tentativas'}
                          </span>
                        </>
                      ) : findDemo(c.id) ? (
                        <span className="badge badge-demo">Tem exemplo pronto</span>
                      ) : (
                        <span className="muted small">Ainda não explicado</span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
