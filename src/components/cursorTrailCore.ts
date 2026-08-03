// ─────────────────────────────────────────────────────────────
// Núcleo puro do TerminalPacketTrail — matemática de cor, spawn
// e curvas de vida das partículas. Sem DOM: testável em Node.
// A camada visual (Canvas) vive em CursorTrail.tsx.
// ─────────────────────────────────────────────────────────────

/** Limite de partículas simultâneas — pool fixo, sem alocação por frame. */
export const TRAIL_MAX_PARTICLES = 56

/** Distância percorrida (px) entre nascimentos de partículas. */
export const TRAIL_SPACING = 13
/** Sobre elementos interativos o rastro fica mais curto e definido. */
export const TRAIL_SPACING_INTERACTIVE = 17

/** Vida da partícula (ms): base + variação → 460–680. */
export const TRAIL_LIFE_MIN = 460
export const TRAIL_LIFE_RANGE = 220
/** Banda mais curta durante hover interativo: 450–530 ms. */
export const TRAIL_LIFE_INTERACTIVE_MIN = 450
export const TRAIL_LIFE_INTERACTIVE_RANGE = 80

/** Salto maior que isso é teleporte (retorno à viewport), não movimento. */
export const TRAIL_TELEPORT_DIST = 240

export interface Rgb {
  r: number
  g: number
  b: number
}

/** Converte '#rgb' ou '#rrggbb' (com espaços ao redor) em canais 0–255. */
export function parseHexColor(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(value)) return null
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** Interpolação linear entre duas cores, t ∈ [0, 1]. */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(Math.max(t, 0), 1)
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  }
}

export function rgbCss({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Distribui partículas ao longo de um deslocamento: emite as distâncias
 * (a partir do início do segmento) onde cada uma nasce, espaçadas de
 * `spacing` px, e devolve o resto acumulado para o próximo movimento.
 * Assim o rastro não tem buracos quando o ponteiro se move rápido nem
 * excesso quando os eventos chegam em rajada. Baseado em callback para
 * não alocar arrays na taxa do dispositivo de entrada.
 */
export function forEachSpawnOffset(
  carry: number,
  dist: number,
  spacing: number,
  emit: (offset: number) => void,
): number {
  if (dist <= 0 || spacing <= 0) return carry
  // carry pode exceder o spacing se ele mudou (hover) — nunca recuar
  for (let off = Math.max(spacing - carry, 0); off <= dist; off += spacing) {
    emit(off)
  }
  return (carry + dist) % spacing
}

/** Forma conveniente de `forEachSpawnOffset` para testes. */
export function spawnOffsets(
  carry: number,
  dist: number,
  spacing: number,
): { offsets: number[]; carry: number } {
  const offsets: number[] = []
  const rest = forEachSpawnOffset(carry, dist, spacing, (off) => offsets.push(off))
  return { offsets, carry: rest }
}

export type TrailGlyphKind = 'dot' | 'dash' | 'char'

export interface TrailGlyph {
  kind: TrailGlyphKind
  char: string
}

/**
 * Sorteia a forma da partícula, r ∈ [0, 1). Pontos dominam; caracteres
 * são tempero raro — nada de chuva binária.
 */
export function pickGlyph(r: number): TrailGlyph {
  if (r < 0.5) return { kind: 'dot', char: '' }
  if (r < 0.68) return { kind: 'dash', char: '' }
  if (r < 0.8) return { kind: 'char', char: '>' }
  if (r < 0.88) return { kind: 'char', char: '_' }
  if (r < 0.94) return { kind: 'char', char: '·' }
  if (r < 0.97) return { kind: 'char', char: '0' }
  return { kind: 'char', char: '1' }
}

export type TrailTone = 'primary' | 'secondary' | 'muted'

/** Verde domina; ciano é ocasional; tom apagado dá textura discreta. */
export function pickTone(r: number): TrailTone {
  if (r < 0.15) return 'secondary'
  if (r < 0.45) return 'muted'
  return 'primary'
}

/**
 * Opacidade relativa ao progresso de vida p ∈ [0, 1]: começa cheia,
 * evapora com suavidade (1 − smoothstep).
 */
export function fadeAt(p: number): number {
  const k = Math.min(Math.max(p, 0), 1)
  return 1 - k * k * (3 - 2 * k)
}

/** Escala relativa ao progresso de vida: encolhe de leve até 0.82. */
export function scaleAt(p: number): number {
  const k = Math.min(Math.max(p, 0), 1)
  return 1 - 0.18 * (k * k * (3 - 2 * k))
}

/**
 * Multiplicador de opacidade pela velocidade do ponteiro (px/ms):
 * movimento lento → rastro quase imperceptível; rápido → presença plena.
 */
export function speedAlpha(speed: number): number {
  return Math.min(Math.max(speed / 1.1, 0.32), 1)
}
