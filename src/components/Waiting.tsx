import { useEffect, useState } from 'react'

const STEPS = ['Lendo sua explicação…', 'Comparando com a referência…', 'Montando a correção…']

/** Mostra que a correção está andando, com o tempo passando, e deixa cancelar. */
export default function Waiting({ onCancel }: { onCancel: () => void }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const step = STEPS[Math.min(Math.floor(seconds / 4), STEPS.length - 1)]

  return (
    <div className="waiting" role="status" aria-live="polite">
      <span className="dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>
        {step} <span className="counter">{seconds}s</span>
      </span>
      <button type="button" className="link-button" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  )
}
