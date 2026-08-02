// Valida a introdução: fases, skip, reduced-motion, gating por sessão.
// Captura frames em momentos-chave da timeline.
// Uso: node scripts/intro-review.mjs [urlBase] [pastaSaida]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5173'
const outDir = process.argv[3] ?? 'shots-intro'
mkdirSync(outDir, { recursive: true })

const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

const browser = await chromium.launch()

// ── 1. Sequência completa com frames ────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  ok('intro aparece na primeira visita', (await page.locator('.intro').count()) === 1)
  await page.screenshot({ path: `${outDir}/t0-cursor.png` })

  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${outDir}/t1-digitando.png` })

  await page.waitForTimeout(1300)
  await page.screenshot({ path: `${outDir}/t2-status.png` })

  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${outDir}/t3-revelacao.png` })
  const nameVisible = await page.locator('.intro__name').isVisible()
  ok('nome revelado na fase 4', nameVisible)

  // Espera o fim natural (timeline ~5.4s + margem)
  await page.waitForSelector('.intro', { state: 'detached', timeout: 9000 })
  ok('intro termina sozinha e sai do DOM', true)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${outDir}/t4-hero-handoff.png` })
  const heroVisible = await page.locator('.hero__title').isVisible()
  ok('hero visível após a intro', heroVisible)
  ok('sem erros de página', errors.length === 0, errors.join('; '))

  // ── 2. Gating: reload na mesma sessão não repete ──────────
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  ok('não repete na mesma sessão', (await page.locator('.intro').count()) === 0)
  await page.close()
}

// ── 3. Skip via botão ───────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  await page.locator('.intro__skip').click()
  await page.waitForSelector('.intro', { state: 'detached', timeout: 2500 })
  ok('skip via botão encerra rápido', await page.locator('.hero__title').isVisible())
  await page.close()
}

// ── 4. Skip via Esc ─────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${outDir}/mobile-intro.png` })
  await page.keyboard.press('Escape')
  await page.waitForSelector('.intro', { state: 'detached', timeout: 2500 })
  ok('skip via Esc funciona (mobile)', await page.locator('.hero__title').isVisible())
  await context.close()
}

// ── 5. Decisão do dono: animações sempre — intro aparece
//       mesmo com reduced-motion do sistema ─────────────────
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  ok('intro aparece mesmo com reduced-motion', (await page.locator('.intro').count()) === 1)
  await context.close()
}

await browser.close()

const failures = results.filter((r) => !r.pass)
console.log(JSON.stringify({ total: results.length, failures }, null, 2))
