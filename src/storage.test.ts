import { beforeEach, describe, expect, it } from 'vitest'
import { demoExamples } from './data/demo'
import { attempts, maskKey, settings } from './storage'

beforeEach(() => localStorage.clear())

describe('settings', () => {
  it('guarda a chave sem espaços e remove quando vazia', () => {
    settings.setApiKey('  sk-ant-abc  ')
    expect(settings.getApiKey()).toBe('sk-ant-abc')
    settings.setApiKey('')
    expect(settings.getApiKey()).toBe('')
    expect(localStorage.getItem('explicai:api-key')).toBeNull()
  })

  it('volta para o modelo padrão se o salvo não existir mais', () => {
    localStorage.setItem('explicai:model', 'modelo-antigo')
    expect(settings.getModel()).toBe('claude-haiku-5-5')
    settings.setModel('claude-opus-5-5')
    expect(settings.getModel()).toBe('claude-opus-5-5')
  })
})

describe('maskKey', () => {
  it('mostra só o começo e o fim da chave', () => {
    expect(maskKey('sk-ant-api03-1234567890abcd')).toBe('sk-ant-…abcd')
    expect(maskKey('curta')).toBe('••••')
  })
})

describe('attempts', () => {
  const review = demoExamples[0].review

  it('salva por conceito, do mais recente para o mais antigo', () => {
    attempts.add({ conceptId: 'react', explanation: 'a', review, source: 'demo' }, new Date('2026-01-01'))
    attempts.add({ conceptId: 'react', explanation: 'b', review, source: 'demo' }, new Date('2026-01-02'))
    attempts.add({ conceptId: 'git', explanation: 'c', review, source: 'demo' })

    expect(attempts.forConcept('react').map((a) => a.explanation)).toEqual(['b', 'a'])
    expect(attempts.all()).toHaveLength(3)
  })

  it('apaga uma tentativa e limpa tudo', () => {
    const saved = attempts.add({ conceptId: 'react', explanation: 'a', review, source: 'demo' })
    attempts.add({ conceptId: 'react', explanation: 'b', review, source: 'demo' })
    attempts.remove(saved.id)
    expect(attempts.forConcept('react').map((a) => a.explanation)).toEqual(['b'])
    attempts.clear()
    expect(attempts.all()).toEqual([])
  })

  it('ignora dado corrompido no armazenamento', () => {
    localStorage.setItem('explicai:attempts', '{quebrado')
    expect(attempts.all()).toEqual([])
  })
})
