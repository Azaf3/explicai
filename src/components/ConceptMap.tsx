/** Desenha os passos do conceito como um fluxo de caixas ligadas por setas. */
export default function ConceptMap({ steps }: { steps: string[] }) {
  if (steps.length === 0) return null
  return (
    <ol className="flow" aria-label="Mapa do conceito">
      {steps.map((step, index) => (
        <li key={`${index}-${step}`}>
          <span className="flow-number" aria-hidden="true">
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}
