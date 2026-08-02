// Testa interações reais: terminal, navegação, menu mobile, botão de copiar.
// Uso: node scripts/interaction-review.mjs [urlBase] [pastaSaida]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] ?? 'http://localhost:5173'
const outDir = process.argv[3] ?? 'shots-interaction'
mkdirSync(outDir, { recursive: true })

const results = []
const ok = (name, pass, detail = '') => results.push({ name, pass, detail })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
})
const page = await context.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// 1. Terminal: help
const input = page.locator('#terminal-input')
await input.click()
await input.fill('help')
await input.press('Enter')
const helpText = await page.locator('.terminal__output').innerText()
ok('terminal help', helpText.includes('comandos disponíveis') && helpText.includes('whoami'))
await page.screenshot({ path: `${outDir}/terminal-help.png` })

// 2. Autocomplete Tab
await input.fill('pro')
await input.press('Tab')
ok('autocomplete tab', (await input.inputValue()) === 'projects')

// 3. Executa projects — deve rolar até a seção
await input.press('Enter')
await page.waitForTimeout(900)
const projectsVisible = await page.locator('#projetos').evaluate((el) => {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
})
ok('comando projects rola até seção', projectsVisible)

// 4. Histórico com seta
await input.click()
await input.press('ArrowUp')
const hist1 = await input.inputValue()
ok('histórico ↑', hist1 === 'projects', `valor: ${hist1}`)
await input.press('Escape')
await input.fill('')

// 5. Comando desconhecido
await input.fill('xyz')
await input.press('Enter')
const errText = await page.locator('.terminal__line--error').last().innerText()
ok('comando desconhecido mostra erro', errText.includes('xyz'))

// 6. clear — re-semeia apenas a dica de uso (estado vazio orientado)
await input.fill('clear')
await input.press('Enter')
const entryCount = await page.locator('.terminal__entry').count()
const afterClear = await page.locator('.terminal__output').innerText()
ok('clear limpa terminal', entryCount === 1 && afterClear.includes('help'), `entries: ${entryCount}`)

// 7. Chip rápido
await page.locator('.terminal__chip', { hasText: 'help' }).click()
ok('chip help executa', (await page.locator('.terminal__output').innerText()).includes('comandos'))

// 8. Navegação topo: clique em ./stack
await page.locator('.topbar__nav .topbar__link', { hasText: 'stack' }).click()
await page.waitForTimeout(900)
const stackActive = await page
  .locator('.topbar__link--active')
  .first()
  .innerText()
  .catch(() => '')
ok('nav destaca seção ativa', stackActive.includes('stack'), `ativo: ${stackActive}`)

// 9. Copiar e-mail
await page.locator('#contato').scrollIntoViewIfNeeded()
await page.locator('#contato .copy-button').click()
await page.waitForTimeout(300)
const clip = await page.evaluate(() => navigator.clipboard.readText())
ok('copiar e-mail', clip === 'joaowehner@gmail.com', `clipboard: ${clip}`)
await page.screenshot({ path: `${outDir}/copy-feedback.png` })

// 10. Links externos respondem (HEAD/GET)
const hrefs = await page.$$eval('a[href^="http"]', (as) => [...new Set(as.map((a) => a.href))])
for (const href of hrefs) {
  try {
    const resp = await page.request.fetch(href, { method: 'GET', timeout: 15000 })
    const status = resp.status()
    ok(`link ${href}`, status < 400 || status === 999, `status ${status}`)
  } catch (e) {
    ok(`link ${href}`, false, String(e).slice(0, 120))
  }
}

// 11. Menu mobile
const mob = await context.newPage()
await mob.setViewportSize({ width: 390, height: 844 })
await mob.goto(url, { waitUntil: 'networkidle' })
await mob.locator('.topbar__menu-button').click()
const menuVisible = await mob.locator('#menu-mobile').isVisible()
ok('menu mobile abre', menuVisible)
await mob.screenshot({ path: `${outDir}/mobile-menu.png` })
await mob.locator('#menu-mobile .topbar__link', { hasText: 'contato' }).click()
await mob.waitForTimeout(900)
const menuClosed = (await mob.locator('#menu-mobile').count()) === 0
const contatoVisible = await mob.locator('#contato').evaluate((el) => {
  const r = el.getBoundingClientRect()
  return r.top < window.innerHeight && r.bottom > 0
})
ok('menu mobile navega e fecha', menuClosed && contatoVisible)

// 12. Navegação por teclado: Tab até o primeiro CTA
const kb = await context.newPage()
await kb.goto(url, { waitUntil: 'networkidle' })
await kb.keyboard.press('Tab') // skip-link
const skipFocused = await kb.evaluate(() => document.activeElement?.className ?? '')
ok('skip-link é o primeiro foco', skipFocused.includes('skip-link'), skipFocused)

await browser.close()

const failures = results.filter((r) => !r.pass)
console.log(JSON.stringify({ total: results.length, failures, consoleErrors }, null, 2))
