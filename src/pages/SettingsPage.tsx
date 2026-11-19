import { useState } from 'react'
import { PROVIDERS, getProvider, type ProviderId } from '../ai/review'
import { attempts, maskKey, settings } from '../storage'

export default function SettingsPage() {
  const [provider, setProvider] = useState<ProviderId>(settings.getProvider)
  const [savedKey, setSavedKey] = useState(() => settings.getApiKey(provider))
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState(() => settings.getModel(provider))
  const [count, setCount] = useState(() => attempts.all().length)
  const [message, setMessage] = useState('')

  const info = getProvider(provider)

  function chooseProvider(id: ProviderId) {
    settings.setProvider(id)
    setProvider(id)
    setSavedKey(settings.getApiKey(id))
    setModel(settings.getModel(id))
    setDraft('')
    setMessage('')
  }

  function saveKey(event: React.FormEvent) {
    event.preventDefault()
    settings.setApiKey(provider, draft)
    setSavedKey(settings.getApiKey(provider))
    setDraft('')
    setMessage('Chave salva neste navegador.')
  }

  function removeKey() {
    settings.setApiKey(provider, '')
    setSavedKey('')
    setMessage('Chave removida.')
  }

  function chooseModel(id: string) {
    settings.setModel(provider, id)
    setModel(id)
  }

  function clearHistory() {
    if (!window.confirm('Apagar todas as suas tentativas? Não dá pra desfazer.')) return
    attempts.clear()
    setCount(0)
    setMessage('Histórico apagado.')
  }

  return (
    <article className="settings">
      <h1>Configurações</h1>
      <p className="lead">
        O Explicaí não tem servidor. A correção é feita chamando a IA direto do seu navegador, com a sua
        chave.
      </p>

      <section className="panel">
        <h2>Qual IA corrige</h2>
        <fieldset className="options">
          <legend className="sr-only">Provedor de IA</legend>
          {PROVIDERS.map((p) => (
            <label key={p.id} className={provider === p.id ? 'option selected' : 'option'}>
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => chooseProvider(p.id)}
              />
              <span>
                <strong>
                  {p.label}{' '}
                  <span className={`badge ${p.price === 'Grátis' ? 'badge-firme' : 'badge-quase'}`}>
                    {p.price}
                  </span>
                </strong>
                <span className="muted small">{p.keyHint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="panel">
        <h2>Sua chave do {info.label}</h2>
        <p>
          Crie em{' '}
          <a href={info.keyUrl} target="_blank" rel="noreferrer">
            {new URL(info.keyUrl).host}
          </a>{' '}
          e cole aqui.
        </p>
        <ul className="warnings">
          <li>
            A chave fica salva só no localStorage deste navegador e só é enviada para a API do provedor.
          </li>
          <li>
            Qualquer pessoa com acesso a este navegador consegue ver a chave. Não use em computador
            compartilhado.
          </li>
          {info.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>

        {savedKey ? (
          <div className="form-row">
            <span>
              Chave salva: <code>{maskKey(savedKey)}</code>
            </span>
            <button type="button" className="button button-ghost" onClick={removeKey}>
              Remover chave
            </button>
          </div>
        ) : (
          <form onSubmit={saveKey} className="form-row">
            <label htmlFor="api-key" className="sr-only">
              Chave da API
            </label>
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              placeholder={info.keyPlaceholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="button" disabled={!draft.trim()}>
              Salvar chave
            </button>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>Modelo</h2>
        <fieldset className="options">
          <legend className="sr-only">Modelo usado na correção</legend>
          {info.models.map((m) => (
            <label key={m.id} className={model === m.id ? 'option selected' : 'option'}>
              <input
                type="radio"
                name="model"
                value={m.id}
                checked={model === m.id}
                onChange={() => chooseModel(m.id)}
              />
              <span>
                <strong>{m.label}</strong>
                <span className="muted small">{m.note}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="panel">
        <h2>Histórico</h2>
        <p>
          {count === 0
            ? 'Nenhuma tentativa salva.'
            : `${count} ${count === 1 ? 'tentativa salva' : 'tentativas salvas'} neste navegador.`}
        </p>
        {count > 0 && (
          <button type="button" className="button button-ghost" onClick={clearHistory}>
            Apagar histórico
          </button>
        )}
      </section>

      {message && (
        <p className="toast" role="status">
          {message}
        </p>
      )}
    </article>
  )
}
