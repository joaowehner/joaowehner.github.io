// Valida o TerminalPacketTrail: camada, partículas, paleta, hover
// interativo, repouso de CPU, saída da viewport e gates de acesso.
// Uso: node scripts/cursor-trail-review.mjs [urlBase] [pastaSaida]
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5173'
const outDir = process.argv[3] ?? 'shots-cursor-trail'
mkdirSync(outDir, { recursive: true })

const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

// Paleta permitida (tokens --trail-*). Pixels compostos são blends de até
// duas dessas cores (sobreposição translúcida + antialiasing), então a
// validação mede a distância ao segmento entre cada par de cores.
const PALETTE = [
  [62, 207, 142], // --accent
  [108, 184, 214], // --cyan
  [110, 127, 149], // --text-3
  [216, 176, 106], // --amber
]
const distToSegment = (p, a, b) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]]
  const len2 = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2
  const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / len2))
  const d = [a[0] + ab[0] * t - p[0], a[1] + ab[1] * t - p[1], a[2] + ab[2] * t - p[2]]
  return Math.hypot(d[0], d[1], d[2])
}
const inPalette = (r, g, b) => {
  const p = [r, g, b]
  for (let i = 0; i < PALETTE.length; i++) {
    for (let j = i; j < PALETTE.length; j++) {
      if (distToSegment(p, PALETTE[i], PALETTE[j]) <= 36) return true
    }
  }
  return false
}

/**
 * Lê os pixels do trail: contagem, cores distintas e brancos. Cores só são
 * coletadas com alpha ≥ 48 — abaixo disso o getImageData devolve RGB
 * distorcido pelo arredondamento do armazenamento pré-multiplicado.
 */
const readCanvas = (page, box = null) =>
  page.evaluate((region) => {
    const c = document.querySelector('.cursor-trail')
    if (!c || c.width === 0) return { count: 0, colors: [], whites: 0 }
    const ctx = c.getContext('2d')
    const data = ctx.getImageData(0, 0, c.width, c.height).data
    const dpr = c.width / innerWidth
    const colors = new Map()
    let count = 0
    let whites = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      const px = (i / 4) % c.width
      const py = Math.floor(i / 4 / c.width)
      if (region) {
        const inside =
          px >= region.x * dpr &&
          px <= (region.x + region.w) * dpr &&
          py >= region.y * dpr &&
          py <= (region.y + region.h) * dpr
        if (region.outside ? inside : !inside) continue
      }
      count++
      if (data[i + 3] < 48) continue
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
      colors.set(key, (colors.get(key) ?? 0) + 1)
      if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) whites++
    }
    return { count, colors: [...colors.keys()], whites }
  }, box)

const browser = await chromium.launch()

for (const view of [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'notebook-1366', width: 1366, height: 768 },
]) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height } })
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('joaowehner:intro-seen', '1')
    } catch {
      /* sem storage */
    }
    // contador de frames para medir repouso do loop
    const orig = window.requestAnimationFrame.bind(window)
    window.__rafCount = 0
    window.requestAnimationFrame = (fn) => {
      window.__rafCount++
      return orig(fn)
    }
  })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
  page.on('pageerror', (e) => consoleErrors.push(String(e)))

  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  // 1. Camada: fixa, sem eventos, abaixo do nav, tamanho com DPR ≤ 2
  const layer = await page.evaluate(() => {
    const c = document.querySelector('.cursor-trail')
    const s = getComputedStyle(c)
    return {
      pos: s.position,
      pe: s.pointerEvents,
      z: Number(s.zIndex),
      aria: c.getAttribute('aria-hidden'),
      w: c.width,
      expected: Math.round(innerWidth * Math.min(devicePixelRatio, 2)),
    }
  })
  ok(
    `${view.name}: camada do canvas`,
    layer.pos === 'fixed' &&
      layer.pe === 'none' &&
      layer.z === 90 &&
      layer.aria === 'true' &&
      layer.w === layer.expected,
    JSON.stringify(layer),
  )

  // 2. Movimento rápido em curva → partículas presentes, paleta respeitada
  const cx = view.width / 2
  const cy = view.height / 2
  await page.mouse.move(cx - 400, cy)
  for (let i = 1; i <= 4; i++) {
    await page.mouse.move(cx - 400 + i * 200, cy + (i % 2 === 0 ? -120 : 120), { steps: 18 })
  }
  const moving = await readCanvas(page)
  ok(`${view.name}: partículas durante movimento`, moving.count > 40, `pixels: ${moving.count}`)
  const offPalette = moving.colors.filter((c) => !inPalette(...c.split(',').map(Number)))
  ok(`${view.name}: só cores da paleta`, offPalette.length === 0, offPalette.join(' | '))
  ok(`${view.name}: nunca branco puro`, moving.whites === 0, `brancos: ${moving.whites}`)
  await page.screenshot({ path: `${outDir}/${view.name}-movimento.png` })

  // 3. Cursor parado → partículas evaporam; só o caret permanece; rAF dorme
  await page.waitForTimeout(1000)
  const idle = await readCanvas(page, { x: cx + 400 - 24, y: cy - 120 - 24, w: 48, h: 48, outside: true })
  ok(`${view.name}: nada preso após repouso`, idle.count === 0, `pixels fora do caret: ${idle.count}`)
  const rafA = await page.evaluate(() => window.__rafCount)
  await page.waitForTimeout(600)
  const rafB = await page.evaluate(() => window.__rafCount)
  ok(`${view.name}: loop dorme com cursor parado`, rafB - rafA <= 2, `frames em 600ms: ${rafB - rafA}`)

  // 4. Hover em elemento interativo → caret âmbar em retículo
  // (CTA do hero: visível e fora do nav, que cobre o trail por camada)
  const link = page.locator('.hero__cta--secondary').first()
  const bb = await link.boundingBox()
  if (bb) {
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 10 })
    await page.waitForTimeout(350)
    const hover = await readCanvas(page)
    const amber = hover.colors.filter((c) => {
      const [r, g, b] = c.split(',').map(Number)
      return r > 150 && r > g && g > b
    })
    ok(`${view.name}: caret âmbar sobre CTA`, amber.length > 0, `cores: ${hover.colors.join(' | ')}`)
    await page.screenshot({ path: `${outDir}/${view.name}-hover.png` })
  } else {
    ok(`${view.name}: caret âmbar sobre CTA`, false, 'CTA do hero não encontrado')
  }

  // 5. Ponteiro sai da janela → caret desaparece, canvas limpo
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent('pointerout', { pointerType: 'mouse', bubbles: true }))
  })
  await page.waitForTimeout(700)
  const gone = await readCanvas(page)
  ok(`${view.name}: canvas limpo ao sair da viewport`, gone.count === 0, `pixels: ${gone.count}`)

  // 6. Seleção de texto continua funcionando sob a camada
  await page.locator('#sobre').scrollIntoViewIfNeeded()
  const selection = await page.evaluate(() => {
    const p = document.querySelector('#sobre p')
    if (!p) return ''
    const range = document.createRange()
    range.selectNodeContents(p)
    const sel = getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    return sel.toString()
  })
  ok(`${view.name}: seleção de texto livre`, selection.length > 10, `${selection.length} chars`)

  ok(`${view.name}: sem erros de console`, consoleErrors.length === 0, consoleErrors.join(' | '))
  await context.close()
}

// 7. prefers-reduced-motion → efeito totalmente desligado (buffer zerado)
{
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  })
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('joaowehner:intro-seen', '1')
    } catch {
      /* sem storage */
    }
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const w = await page.evaluate(() => document.querySelector('.cursor-trail')?.width)
  ok('reduced-motion desliga o efeito', w === 0, `buffer: ${w}`)
  await context.close()
}

// 8. Dispositivo touch (ponteiro coarse) → efeito nunca ativa
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const w = await page.evaluate(() => document.querySelector('.cursor-trail')?.width)
  ok('touch/coarse não ativa o efeito', w === 0, `buffer: ${w}`)
  await context.close()
}

await browser.close()

const failures = results.filter((r) => !r.pass)
console.log(JSON.stringify({ total: results.length, failures }, null, 2))
process.exitCode = failures.length > 0 ? 1 : 0
