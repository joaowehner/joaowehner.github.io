// Auditoria de acessibilidade com axe-core em desktop e mobile.
// Uso: node scripts/a11y-review.mjs [urlBase]
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const url = process.argv[2] ?? 'http://localhost:5173'
const browser = await chromium.launch()

const report = {}
for (const [name, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const context = await browser.newContext({ viewport })
  // Pula a introdução: a auditoria cobre a página (intro tem suite própria)
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('joaowehner:intro-seen', '1')
    } catch {
      /* sem storage */
    }
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const results = await new AxeBuilder({ page }).analyze()
  report[name] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }))
  await context.close()
}

await browser.close()
console.log(JSON.stringify(report, null, 2))
