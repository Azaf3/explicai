import { DEFAULT_PROVIDER, PROVIDERS, getProvider, type ProviderId, type Review } from './ai/review'

/**
 * Tudo fica no localStorage deste navegador: chaves, modelo e tentativas.
 * Não existe servidor do Explicaí, então nada disso sai daqui, a não ser a chamada para o provedor de IA.
 */
const KEY_PROVIDER = 'explicai:provider'
const keyFor = (provider: ProviderId) => `explicai:api-key:${provider}`
const modelFor = (provider: ProviderId) => `explicai:model:${provider}`
const KEY_ATTEMPTS = 'explicai:attempts'

export interface Attempt {
  id: string
  conceptId: string
  createdAt: string
  explanation: string
  review: Review
  /** Modelo usado, ou 'demo' quando veio dos exemplos prontos. */
  source: string
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Navegação privada ou armazenamento cheio: o app continua, só não lembra.
  }
}

export const settings = {
  getProvider: (): ProviderId => {
    const saved = read(KEY_PROVIDER)
    return PROVIDERS.some((p) => p.id === saved) ? (saved as ProviderId) : DEFAULT_PROVIDER
  },
  setProvider: (provider: ProviderId) => write(KEY_PROVIDER, provider),
  getApiKey: (provider: ProviderId) => read(keyFor(provider)) ?? '',
  setApiKey: (provider: ProviderId, key: string) => write(keyFor(provider), key.trim() || null),
  getModel: (provider: ProviderId): string => {
    const models = getProvider(provider).models
    const saved = read(modelFor(provider))
    return models.some((m) => m.id === saved) ? saved! : models[0].id
  },
  setModel: (provider: ProviderId, model: string) => write(modelFor(provider), model),
}

/** Só pra mostrar na tela sem expor a chave inteira. */
export function maskKey(key: string): string {
  if (key.length <= 12) return '••••'
  return `${key.slice(0, 7)}…${key.slice(-4)}`
}

function readAll(): Attempt[] {
  try {
    const parsed: unknown = JSON.parse(read(KEY_ATTEMPTS) ?? '[]')
    return Array.isArray(parsed) ? (parsed as Attempt[]) : []
  } catch {
    return []
  }
}

export const attempts = {
  all: readAll,
  forConcept: (conceptId: string) =>
    readAll()
      .filter((a) => a.conceptId === conceptId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  add: (attempt: Omit<Attempt, 'id' | 'createdAt'>, now = new Date()): Attempt => {
    const saved: Attempt = { ...attempt, id: crypto.randomUUID(), createdAt: now.toISOString() }
    write(KEY_ATTEMPTS, JSON.stringify([...readAll(), saved]))
    return saved
  },
  remove: (id: string) => write(KEY_ATTEMPTS, JSON.stringify(readAll().filter((a) => a.id !== id))),
  clear: () => write(KEY_ATTEMPTS, null),
}
