// Captura screenshots nas resoluções exigidas + coleta erros de console.
// Uso: node scripts/visual-review.mjs [urlBase] [pastaSaida]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5173'
const outDir = process.argv[3] ?? 'shots'
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-412x915', width: 412, height: 915 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1280x720', width: 1280, height: 720 },
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
]

const fullPageAlso = new Set(['mobile-390x844', 'tablet-768x1024', 'desktop-1440x900'])

const browser = await chromium.launch()
const consoleErrors = []
const overflow = []

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${vp.name}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => consoleErrors.push(`[${vp.name}] pageerror: ${err.message}`))

  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const metrics = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const bad = []
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (style.position === 'fixed') return
      if (r.right > vw + 1 || r.left < -1) {
        bad.push(`${el.tagName}.${String(el.className).split(' ')[0]} right=${Math.round(r.right)}`)
      }
    })
    return { vw, scrollW: document.body.scrollWidth, bad: bad.slice(0, 8) }
  })
  if (metrics.bad.length > 0 || metrics.scrollW > vp.width + 1) {
    overflow.push({ vp: vp.name, ...metrics })
  }

  await page.screenshot({ path: `${outDir}/${vp.name}.png` })
  if (fullPageAlso.has(vp.name)) {
    await page.screenshot({ path: `${outDir}/${vp.name}-full.png`, fullPage: true })
  }
  await page.close()
}

await browser.close()

console.log(JSON.stringify({ consoleErrors, overflow }, null, 2))
