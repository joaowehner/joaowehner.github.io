import { describe, expect, it } from 'vitest'
import { shouldShowIntro } from './introGate'

describe('shouldShowIntro', () => {
  it('mostra na primeira visita da sessão', () => {
    expect(shouldShowIntro({ seen: false })).toBe(true)
  })

  it('não mostra novamente na mesma sessão', () => {
    expect(shouldShowIntro({ seen: true })).toBe(false)
  })
})
