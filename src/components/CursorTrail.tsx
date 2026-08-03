import { useEffect, useRef } from 'react'
import {
  TRAIL_MAX_PARTICLES,
  TRAIL_SPACING,
  TRAIL_SPACING_INTERACTIVE,
  TRAIL_LIFE_MIN,
  TRAIL_LIFE_RANGE,
  TRAIL_LIFE_INTERACTIVE_MIN,
  TRAIL_LIFE_INTERACTIVE_RANGE,
  TRAIL_TELEPORT_DIST,
  parseHexColor,
  mixRgb,
  rgbCss,
  forEachSpawnOffset,
  pickGlyph,
  pickTone,
  fadeAt,
  scaleAt,
  speedAlpha,
  type Rgb,
} from './cursorTrailCore'
import '../styles/cursor-trail.css'

// ─────────────────────────────────────────────────────────────
// TerminalPacketTrail — microinteração nativa do terminal do site.
// Um caret (quadrado vazado) acompanha o ponteiro; o movimento
// emite um fluxo curto e discreto de "pacotes" monoespaçados
// (·, >, _, 0, 1) que evaporam em ~0,5 s. Sobre elementos
// interativos o caret abre em retículo [ ] âmbar.
//
// Tudo vive em refs e num pool fixo — nenhum setState por evento
// de ponteiro, nenhuma alocação relevante por frame. O rAF só
// roda enquanto há algo para animar.
// ─────────────────────────────────────────────────────────────

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor-interactive]'

/** Fallback caso o token --font-mono não resolva. */
const MONO_STACK = "'JetBrains Mono Variable', ui-monospace, 'Cascadia Code', Consolas, monospace"

interface Particle {
  alive: boolean
  x: number
  y: number
  vx: number
  vy: number
  born: number
  life: number
  size: number
  alpha: number
  kind: 0 | 1 | 2 // ponto | segmento | caractere
  char: string
  color: string
}

function makeParticle(): Particle {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    born: 0,
    life: 1,
    size: 1,
    alpha: 0,
    kind: 0,
    char: '',
    color: '',
  }
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Cores lidas dos tokens — o efeito nunca diverge do tema
    const rootStyles = getComputedStyle(document.documentElement)
    const readToken = (name: string, fallback: string): Rgb =>
      parseHexColor(rootStyles.getPropertyValue(name)) ?? (parseHexColor(fallback) as Rgb)
    const PRIMARY = readToken('--trail-primary', '#3ecf8e')
    const SECONDARY = readToken('--trail-secondary', '#6cb8d6')
    const INTERACTIVE = readToken('--trail-interactive', '#d8b06a')
    const MUTED = readToken('--trail-muted', '#6e7f95')
    const TONE_CSS: Record<'primary' | 'secondary' | 'muted', string> = {
      primary: rgbCss(PRIMARY),
      secondary: rgbCss(SECONDARY),
      muted: rgbCss(MUTED),
    }
    const INTERACTIVE_CSS = rgbCss(INTERACTIVE)

    // Fontes pré-montadas por tamanho (6–9 px) a partir do token
    // --font-mono — sem strings novas por frame
    const monoStack = rootStyles.getPropertyValue('--font-mono').trim() || MONO_STACK
    const charFonts = [6, 7, 8, 9].map((px) => `500 ${px}px ${monoStack}`)

    // Pool fixo em anel: sob pressão, a partícula mais antiga é reciclada
    const pool: Particle[] = Array.from({ length: TRAIL_MAX_PARTICLES }, makeParticle)
    let poolHead = 0
    let aliveCount = 0

    // Estado do ponteiro
    let px = 0
    let py = 0
    let pt = 0
    let hasPointer = false
    let carry = 0
    let speed = 0 // px/ms, suavizada
    let interactive = false
    let lastTarget: EventTarget | null = null

    // Estado do caret
    let cx = 0
    let cy = 0
    let presence = 0 // 0 → invisível, 1 → visível
    let morph = 0 // 0 → quadrado, 1 → retículo [ ]

    // Loop
    let raf = 0
    let running = false
    let lastFrame = 0
    let vw = 0
    let vh = 0
    let active = false

    const resize = () => {
      // a caixa real do canvas exclui a barra de rolagem clássica —
      // innerWidth a inclui e desalinharia o desenho perto da borda
      const rect = canvas.getBoundingClientRect()
      vw = rect.width || document.documentElement.clientWidth
      vh = rect.height || document.documentElement.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // redimensionar apaga o canvas; um frame recoloca o caret
      ensureRunning()
    }

    // Mover a janela para um monitor de outra densidade muda o DPR sem
    // disparar resize — a media query de resolução cobre esse caso e
    // precisa ser re-inscrita a cada mudança
    let dprMql: MediaQueryList | null = null
    const onDprChange = () => {
      resize()
      watchDpr()
    }
    const watchDpr = () => {
      dprMql?.removeEventListener('change', onDprChange)
      dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
      dprMql.addEventListener('change', onDprChange)
    }
    const unwatchDpr = () => {
      dprMql?.removeEventListener('change', onDprChange)
      dprMql = null
    }

    const ensureRunning = () => {
      if (running || !active) return
      running = true
      lastFrame = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const spawn = (x: number, y: number, vxMs: number, vyMs: number) => {
      const p = pool[poolHead]
      poolHead = (poolHead + 1) % TRAIL_MAX_PARTICLES
      const glyph = pickGlyph(Math.random())
      if (!p.alive) aliveCount++
      p.alive = true
      p.x = x
      p.y = y
      // deslocamento residual: fração da velocidade do ponteiro, com teto
      const drift = 42
      p.vx = Math.max(-120, Math.min(120, vxMs * drift))
      p.vy = Math.max(-120, Math.min(120, vyMs * drift))
      p.born = performance.now()
      p.life = interactive
        ? TRAIL_LIFE_INTERACTIVE_MIN + Math.random() * TRAIL_LIFE_INTERACTIVE_RANGE
        : TRAIL_LIFE_MIN + Math.random() * TRAIL_LIFE_RANGE
      p.size = 0.65 + Math.random() * 0.35
      p.alpha = (glyph.kind === 'dot' ? 0.5 : 0.42) * speedAlpha(speed)
      p.kind = glyph.kind === 'dot' ? 0 : glyph.kind === 'dash' ? 1 : 2
      p.char = glyph.char
      p.color = interactive ? INTERACTIVE_CSS : TONE_CSS[pickTone(Math.random())]
    }

    // Contexto do segmento em curso — callback persistente para o spawn
    // não alocar closures na taxa do dispositivo de entrada
    let segDx = 0
    let segDy = 0
    let segDist = 0
    let segVx = 0
    let segVy = 0
    const emitSpawn = (off: number) => {
      const f = off / segDist
      spawn(px + segDx * f, py + segDy * f, segVx, segVy)
    }

    const sample = (x: number, y: number, t: number) => {
      if (!hasPointer) {
        // primeira amostra (ou retorno à viewport): sem rastro fantasma
        hasPointer = true
        px = cx = x
        py = cy = y
        pt = t
        carry = 0
        speed = 0
        return
      }
      const dx = x - px
      const dy = y - py
      const dist = Math.hypot(dx, dy)
      const dtms = Math.min(Math.max(t - pt, 4), 64)
      pt = t
      if (dist > TRAIL_TELEPORT_DIST) {
        px = cx = x
        py = cy = y
        carry = 0
        speed = 0
        return
      }
      speed += (dist / dtms - speed) * 0.35
      const spacing = interactive ? TRAIL_SPACING_INTERACTIVE : TRAIL_SPACING
      segDx = dx
      segDy = dy
      segDist = dist
      segVx = dx / dtms
      segVy = dy / dtms
      carry = forEachSpawnOffset(carry, dist, spacing, emitSpawn)
      px = x
      py = y
    }

    const updateTarget = (target: EventTarget | null) => {
      if (target === lastTarget) return
      lastTarget = target
      interactive = target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null
    }

    const onPointerMove = (e: PointerEvent) => {
      // híbridos: dedo na tela não é cursor, mesmo com mouse conectado
      if (document.hidden || e.pointerType === 'touch') return
      updateTarget(e.target)
      const coalesced =
        typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : []
      if (coalesced.length > 0) {
        for (const ev of coalesced) sample(ev.clientX, ev.clientY, ev.timeStamp)
      } else {
        sample(e.clientX, e.clientY, e.timeStamp)
      }
      ensureRunning()
    }

    // Scroll sob o cursor parado troca o alvo do hover sem pointermove
    const onPointerOver = (e: PointerEvent) => {
      if (document.hidden || e.pointerType === 'touch') return
      updateTarget(e.target)
      ensureRunning()
    }

    const onPointerOut = (e: PointerEvent) => {
      // relatedTarget nulo = ponteiro saiu da janela
      if (e.pointerType !== 'touch' && e.relatedTarget === null) {
        hasPointer = false
        lastTarget = null
        interactive = false
        ensureRunning()
      }
    }

    // Drag nativo (link, texto selecionado) cancela o fluxo de eventos;
    // tratar como saída evita um risco fantasma quando o fluxo volta
    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      hasPointer = false
      ensureRunning()
    }

    // Rolagem sob o cursor parado troca o elemento sob ele sem disparar
    // pointerover em todos os navegadores — reavalia por hit-test
    const onScroll = () => {
      if (!hasPointer || document.hidden) return
      updateTarget(document.elementFromPoint(px, py))
      ensureRunning()
    }

    const dropAll = () => {
      for (const p of pool) p.alive = false
      aliveCount = 0
    }

    const onVisibility = () => {
      if (!document.hidden) {
        // a viewport pode ter mudado enquanto a aba esteve oculta
        resize()
        return
      }
      // aba invisível: nada nasce, nada fica preso na tela
      dropAll()
      hasPointer = false
      presence = 0
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      running = false
      ctx.clearRect(0, 0, vw, vh)
    }

    const drawCaret = (color: string, alpha: number) => {
      const size = 7 + morph * 4
      const half = size / 2
      // cada aresta são dois traços partindo dos cantos; o vão central
      // cresce com o morph — quadrado fechado vira retículo [ ]
      const seg = half * (1 - morph * 0.68)
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.lineWidth = 1
      ctx.beginPath()
      const l = cx - half
      const r = cx + half
      const t = cy - half
      const b = cy + half
      // topo
      ctx.moveTo(l, t)
      ctx.lineTo(l + seg, t)
      ctx.moveTo(r - seg, t)
      ctx.lineTo(r, t)
      // base
      ctx.moveTo(l, b)
      ctx.lineTo(l + seg, b)
      ctx.moveTo(r - seg, b)
      ctx.lineTo(r, b)
      // esquerda
      ctx.moveTo(l, t)
      ctx.lineTo(l, t + seg)
      ctx.moveTo(l, b - seg)
      ctx.lineTo(l, b)
      // direita
      ctx.moveTo(r, t)
      ctx.lineTo(r, t + seg)
      ctx.moveTo(r, b - seg)
      ctx.lineTo(r, b)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(Math.max(now - lastFrame, 1), 48) / 1000
      lastFrame = now
      ctx.clearRect(0, 0, vw, vh)

      // caret: resposta quase imediata, sem parecer pesado
      cx += (px - cx) * (1 - Math.exp(-dt * 30))
      cy += (py - cy) * (1 - Math.exp(-dt * 30))
      const presenceTarget = hasPointer ? 1 : 0
      presence += (presenceTarget - presence) * (1 - Math.exp(-dt * 10))
      const morphTarget = interactive ? 1 : 0
      morph += (morphTarget - morph) * (1 - Math.exp(-dt * 12))

      // partículas
      const decay = Math.exp(-dt * 6)
      let count = 0
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of pool) {
        if (!p.alive) continue
        const prog = (now - p.born) / p.life
        if (prog >= 1) {
          p.alive = false
          continue
        }
        count++
        p.vx *= decay
        p.vy *= decay
        p.x += p.vx * dt
        p.y += p.vy * dt
        const a = p.alpha * fadeAt(prog)
        if (a <= 0.004) continue
        const s = p.size * scaleAt(prog)
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        if (p.kind === 0) {
          const d = Math.max(1.4, 2.4 * s)
          ctx.fillRect(p.x - d / 2, p.y - d / 2, d, d)
        } else if (p.kind === 1) {
          const w = 5 * s
          ctx.fillRect(p.x - w / 2, p.y - 0.5, w, 1)
        } else {
          const idx = Math.min(Math.max(Math.round(9 * s) - 6, 0), charFonts.length - 1)
          ctx.font = charFonts[idx]
          ctx.fillText(p.char, p.x, p.y)
        }
      }
      aliveCount = count
      ctx.globalAlpha = 1

      if (presence > 0.02) {
        drawCaret(rgbCss(mixRgb(PRIMARY, INTERACTIVE, morph)), 0.75 * presence)
      }

      // dormir quando tudo assentou — CPU zero com o cursor parado
      const caretSettled = Math.abs(px - cx) < 0.3 && Math.abs(py - cy) < 0.3
      const presenceSettled = hasPointer ? presence > 0.995 : presence < 0.01
      const morphSettled = Math.abs(morph - morphTarget) < 0.01
      if (aliveCount === 0 && caretSettled && presenceSettled && morphSettled) {
        running = false
        if (!hasPointer) ctx.clearRect(0, 0, vw, vh)
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const activate = () => {
      if (active) return
      active = true
      resize()
      watchDpr()
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerover', onPointerOver, { passive: true })
      window.addEventListener('pointerout', onPointerOut, { passive: true })
      window.addEventListener('pointercancel', onPointerCancel, { passive: true })
      window.addEventListener('resize', resize)
      document.addEventListener('scroll', onScroll, { passive: true, capture: true })
      document.addEventListener('visibilitychange', onVisibility)
    }

    const deactivate = () => {
      // buffer zerado mesmo sem ativação prévia: canvas some sem custo
      canvas.width = 0
      canvas.height = 0
      if (!active) return
      active = false
      unwatchDpr()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('resize', resize)
      document.removeEventListener('scroll', onScroll, { capture: true })
      document.removeEventListener('visibilitychange', onVisibility)
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      running = false
      dropAll()
      hasPointer = false
      presence = 0
      morph = 0
      lastTarget = null
      interactive = false
    }

    // Só em ponteiro fino e sem preferência por menos movimento;
    // reage a mudanças (mouse plugado/removido, ajuste do sistema)
    const syncEnabled = () => {
      if (finePointer.matches && !reducedMotion.matches) activate()
      else deactivate()
    }
    syncEnabled()
    finePointer.addEventListener('change', syncEnabled)
    reducedMotion.addEventListener('change', syncEnabled)

    return () => {
      finePointer.removeEventListener('change', syncEnabled)
      reducedMotion.removeEventListener('change', syncEnabled)
      deactivate()
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />
}
