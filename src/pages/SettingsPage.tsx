import { useState } from 'react'
import { MODELS, type ModelId } from '../ai/review'
import { attempts, maskKey, settings } from '../storage'

export default function SettingsPage() {
  const [savedKey, setSavedKey] = useState(settings.getApiKey)
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState<ModelId>(settings.getModel)
  const [count, setCount] = useState(() => attempts.all().length)
  const [message, setMessage] = useState('')

  function saveKey(event: React.FormEvent) {
    event.preventDefault()
    settings.setApiKey(draft)
    setSavedKey(settings.getApiKey())
    setDraft('')
    setMessage('Chave salva neste navegador.')
  }

  function removeKey() {
    settings.setApiKey('')
    setSavedKey('')
    setMessage('Chave removida.')
  }

  function chooseModel(id: ModelId) {
    settings.setModel(id)
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

      <section className="panel">
        <h2>Sua chave da API</h2>
        <p>
          O Explicaí não tem servidor. A correção é feita chamando a API da Anthropic direto do seu navegador,
          com a sua chave. Crie uma em{' '}
          <a href="https://platform.claude.com/" target="_blank" rel="noreferrer">
            platform.claude.com
          </a>
          .
        </p>
        <ul className="warnings">
          <li>
            A chave fica salva só no localStorage deste navegador e só é enviada para api.anthropic.com.
          </li>
          <li>
            Qualquer pessoa com acesso a este navegador consegue ver a chave. Não use em computador
            compartilhado.
          </li>
          <li>Prefira uma chave só para isso, com limite de gasto definido no painel da Anthropic.</li>
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
              placeholder="sk-ant-..."
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
        <fieldset className="models">
          <legend className="sr-only">Modelo usado na correção</legend>
          {MODELS.map((m) => (
            <label key={m.id} className={model === m.id ? 'model selected' : 'model'}>
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
