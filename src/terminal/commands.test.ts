import { describe, expect, it } from 'vitest'
import { commands, completeCommand, quickCommands, runCommand } from './commands'
import { profile } from '../data/profile'

describe('runCommand', () => {
  it('help lista todos os comandos', () => {
    const { lines } = runCommand('help', profile)
    const text = lines.map((l) => l.text).join('\n')
    for (const c of commands) {
      expect(text).toContain(c.name)
    }
  })

  it('whoami apresenta nome e papel', () => {
    const { lines } = runCommand('whoami', profile)
    const text = lines.map((l) => l.text).join('\n')
    expect(text).toContain(profile.displayName)
    expect(text).toContain(profile.role)
  })

  it('projects navega até a seção de projetos', () => {
    const { action } = runCommand('projects', profile)
    expect(action).toEqual({ type: 'goto', section: 'projetos' })
  })

  it('github abre a URL vinda do profile (nunca de entrada do usuário)', () => {
    const { action } = runCommand('github', profile)
    expect(action?.type).toBe('open')
    if (action?.type === 'open') {
      expect(action.url).toBe('https://github.com/joaowehner')
    }
  })

  it('clear retorna ação de limpeza', () => {
    const { action, lines } = runCommand('clear', profile)
    expect(action).toEqual({ type: 'clear' })
    expect(lines).toHaveLength(0)
  })

  it('entrada vazia não produz saída', () => {
    expect(runCommand('   ', profile).lines).toHaveLength(0)
  })

  it('comando desconhecido retorna erro com sugestão', () => {
    const { lines, action } = runCommand('gitub', profile)
    expect(action).toBeUndefined()
    expect(lines[0]?.kind).toBe('error')
    expect(lines[0]?.text).toContain('gitub')
  })

  it('é case-insensitive e ignora espaços', () => {
    const { action } = runCommand('  GitHub  ', profile)
    expect(action?.type).toBe('open')
  })

  it('nunca interpreta HTML da entrada', () => {
    const { lines } = runCommand('<script>alert(1)</script>', profile)
    expect(lines[0]?.kind).toBe('error')
    expect(lines[0]?.text).toContain('<script>alert(1)</script>')
  })
})

describe('completeCommand', () => {
  it('completa por prefixo', () => {
    expect(completeCommand('pro')).toEqual(['projects'])
    expect(completeCommand('l')).toEqual(['links', 'linkedin'])
  })

  it('prefixo vazio não sugere nada', () => {
    expect(completeCommand('')).toEqual([])
  })
})

describe('quickCommands', () => {
  it('todos os atalhos existem como comandos', () => {
    const names = new Set(commands.map((c) => c.name))
    for (const q of quickCommands) {
      expect(names.has(q)).toBe(true)
    }
  })
})
