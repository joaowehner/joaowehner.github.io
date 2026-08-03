import { describe, expect, it } from 'vitest'
import {
  parseHexColor,
  mixRgb,
  rgbCss,
  spawnOffsets,
  pickGlyph,
  pickTone,
  fadeAt,
  scaleAt,
  speedAlpha,
} from './cursorTrailCore'

describe('parseHexColor', () => {
  it('lê #rrggbb com espaços ao redor (valor vindo de getComputedStyle)', () => {
    expect(parseHexColor(' #3ecf8e ')).toEqual({ r: 62, g: 207, b: 142 })
  })

  it('expande #rgb', () => {
    expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('rejeita valores que não são hex', () => {
    expect(parseHexColor('')).toBeNull()
    expect(parseHexColor('rgb(1, 2, 3)')).toBeNull()
    expect(parseHexColor('#12345')).toBeNull()
  })
})

describe('mixRgb', () => {
  const green = { r: 62, g: 207, b: 142 }
  const amber = { r: 216, g: 176, b: 106 }

  it('devolve os extremos em t=0 e t=1', () => {
    expect(mixRgb(green, amber, 0)).toEqual(green)
    expect(mixRgb(green, amber, 1)).toEqual(amber)
  })

  it('limita t fora de [0, 1]', () => {
    expect(mixRgb(green, amber, -2)).toEqual(green)
    expect(mixRgb(green, amber, 5)).toEqual(amber)
  })

  it('formata como rgb() para o Canvas', () => {
    expect(rgbCss(green)).toBe('rgb(62, 207, 142)')
  })
})

describe('spawnOffsets', () => {
  it('espaça partículas ao longo do deslocamento e acumula o resto', () => {
    const { offsets, carry } = spawnOffsets(0, 30, 12)
    expect(offsets).toEqual([12, 24])
    expect(carry).toBe(6)
  })

  it('considera a distância já acumulada de movimentos anteriores', () => {
    const { offsets, carry } = spawnOffsets(6, 30, 12)
    expect(offsets).toEqual([6, 18, 30])
    expect(carry).toBe(0)
  })

  it('não emite nada em movimentos menores que o espaçamento', () => {
    const { offsets, carry } = spawnOffsets(2, 3, 12)
    expect(offsets).toEqual([])
    expect(carry).toBe(5)
  })

  it('é neutro para distância zero ou espaçamento inválido', () => {
    expect(spawnOffsets(4, 0, 12)).toEqual({ offsets: [], carry: 4 })
    expect(spawnOffsets(4, 10, 0)).toEqual({ offsets: [], carry: 4 })
  })

  it('nunca recua quando o espaçamento diminui com carry acumulado', () => {
    // hover usa espaçamento 17; ao voltar para 13 o carry pode ser ≥ 13
    const { offsets, carry } = spawnOffsets(16, 20, 13)
    expect(offsets).toEqual([0, 13])
    expect(carry).toBe(10)
  })
})

describe('pickGlyph', () => {
  it('pontos dominam a distribuição', () => {
    expect(pickGlyph(0).kind).toBe('dot')
    expect(pickGlyph(0.49).kind).toBe('dot')
  })

  it('caracteres 0 e 1 são raros — sem chuva binária', () => {
    const binary = [0.94, 0.95, 0.96, 0.97, 0.98, 0.99].filter((r) => {
      const g = pickGlyph(r)
      return g.char === '0' || g.char === '1'
    })
    expect(binary.length).toBe(6)
    expect(pickGlyph(0.93).char).toBe('·')
    expect(pickGlyph(0.7).char).toBe('>')
  })
})

describe('pickTone', () => {
  it('verde domina; ciano é ocasional', () => {
    expect(pickTone(0.1)).toBe('secondary')
    expect(pickTone(0.3)).toBe('muted')
    expect(pickTone(0.9)).toBe('primary')
  })
})

describe('curvas de vida', () => {
  it('fadeAt evapora de 1 a 0 sem sair do intervalo', () => {
    expect(fadeAt(0)).toBe(1)
    expect(fadeAt(1)).toBe(0)
    expect(fadeAt(0.5)).toBeGreaterThan(0)
    expect(fadeAt(0.5)).toBeLessThan(1)
    expect(fadeAt(2)).toBe(0)
  })

  it('scaleAt encolhe de leve, nunca abaixo de 0.82', () => {
    expect(scaleAt(0)).toBe(1)
    expect(scaleAt(1)).toBeCloseTo(0.82)
  })

  it('speedAlpha atenua movimento lento e satura no rápido', () => {
    expect(speedAlpha(0)).toBe(0.32)
    expect(speedAlpha(0.2)).toBe(0.32)
    expect(speedAlpha(5)).toBe(1)
  })
})
