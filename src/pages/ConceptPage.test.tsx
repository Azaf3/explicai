import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { demoExamples } from '../data/demo'
import { attempts, settings } from '../storage'
import ConceptPage from './ConceptPage'

function apiReply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

const rawDemo = {
  veredito: 'quase',
  resumo: demoExamples[0].review.summary,
  acertos: demoExamples[0].review.correct,
  ajustes: [],
  perguntas: [],
  versao_ajustada: 'texto',
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/conceito/:id" element={<ConceptPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('ConceptPage', () => {
  it('sem chave, mostra o exemplo pronto sem chamar a API', async () => {
    const spy = vi.fn()
    vi.stubGlobal('fetch', spy)
    renderAt('/conceito/react')

    expect(screen.queryByRole('button', { name: 'Pedir correção' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ver um exemplo pronto' }))

    expect(screen.getByText('Exemplo pronto')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Mapa do conceito' })).toHaveTextContent(
      'React atualiza só o que mudou',
    )
    expect(screen.getByLabelText(/Explica aí/)).toHaveValue(demoExamples[0].explanation)
    expect(spy).not.toHaveBeenCalled()
    expect(attempts.all()).toHaveLength(0)
  })

  it('com chave do Gemini (padrão), envia a explicação, mostra a correção e salva no histórico', async () => {
    settings.setApiKey('gemini', 'AIza-teste-1234567890')
    const spy = vi
      .fn()
      .mockResolvedValue(
        apiReply({ candidates: [{ content: { parts: [{ text: JSON.stringify(rawDemo) }] } }] }),
      )
    vi.stubGlobal('fetch', spy)
    renderAt('/conceito/react')

    const button = screen.getByRole('button', { name: 'Pedir correção' })
    expect(button).toBeDisabled()

    await userEvent.type(
      screen.getByLabelText(/Explica aí/),
      'React monta a tela com componentes e atualiza o que mudou.',
    )
    await userEvent.click(button)

    expect(await screen.findAllByRole('region', { name: 'Correção' })).not.toHaveLength(0)
    expect(spy.mock.calls[0][0]).toContain('generativelanguage.googleapis.com')
    expect(spy.mock.calls[0][1].headers['x-goog-api-key']).toBe('AIza-teste-1234567890')
    expect(screen.getByText('Suas tentativas (1)')).toBeInTheDocument()
  })

  it('com o Claude escolhido, mostra a mensagem de erro da API', async () => {
    settings.setProvider('anthropic')
    settings.setApiKey('anthropic', 'sk-ant-teste-1234567890')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(apiReply({ error: { message: 'invalid x-api-key' } }, 401)),
    )
    renderAt('/conceito/react')

    await userEvent.type(
      screen.getByLabelText(/Explica aí/),
      'React monta a tela com componentes e atualiza o que mudou.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Pedir correção' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('A chave da Anthropic foi recusada')
  })

  it('avisa quando o conceito não existe', () => {
    renderAt('/conceito/nao-existe')
    expect(screen.getByText('Conceito não encontrado')).toBeInTheDocument()
  })
})
