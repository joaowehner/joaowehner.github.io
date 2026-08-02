// Gera public/og.png (1200x630) a partir de um template HTML inline
// coerente com os tokens do site. Uso: node scripts/og-image.mjs
import { chromium } from 'playwright'

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: 'JetBrains Mono'; src: local('JetBrains Mono'); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background: #0a0d12;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #dce5ef;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  body::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(50rem 24rem at 80% -10%, rgba(62,207,142,.08), transparent 60%),
      radial-gradient(40rem 20rem at 8% -12%, rgba(108,184,214,.06), transparent 60%);
  }
  .window {
    width: 980px;
    background: #0f141c;
    border: 1px solid #1c2634;
    border-radius: 18px;
    box-shadow: 0 40px 90px -40px rgba(0,0,0,.7);
    overflow: hidden;
  }
  .bar {
    display: flex; align-items: center; gap: 10px;
    padding: 18px 24px; background: #0c1017; border-bottom: 1px solid #1c2634;
  }
  .dot { width: 14px; height: 14px; border-radius: 50%; }
  .title {
    margin-inline: auto; transform: translateX(-21px);
    color: #5d6c80; font-family: Consolas, monospace; font-size: 17px;
  }
  .body { padding: 44px 52px 52px; }
  .prompt { font-family: Consolas, monospace; font-size: 22px; color: #3ecf8e; margin-bottom: 18px; }
  .prompt span { color: #5d6c80; }
  h1 { font-size: 76px; font-weight: 700; letter-spacing: -2px; line-height: 1.05; }
  .role { font-family: Consolas, monospace; font-size: 30px; color: #3ecf8e; margin-top: 10px; }
  .sub { font-size: 28px; color: #93a4b8; margin-top: 26px; max-width: 30ch; line-height: 1.4; }
  .foot {
    margin-top: 34px; font-family: Consolas, monospace; font-size: 20px; color: #5d6c80;
    display: flex; gap: 26px;
  }
  .foot b { color: #93a4b8; font-weight: 500; }
</style></head>
<body>
  <div class="window">
    <div class="bar">
      <div class="dot" style="background:#ff5f56"></div>
      <div class="dot" style="background:#ffbd2e"></div>
      <div class="dot" style="background:#27c93f"></div>
      <div class="title">joaowehner@web — zsh</div>
    </div>
    <div class="body">
      <div class="prompt"><span>~ $</span> whoami</div>
      <h1>João Wehner</h1>
      <div class="role">Desenvolvedor Full-Stack</div>
      <div class="sub">Construo tecnologia para os mercados imobiliário e de crédito.</div>
      <div class="foot"><b>github.com/joaowehner</b><b>React · TypeScript · Node · Supabase</b></div>
    </div>
  </div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'public/og.png' })
await browser.close()
console.log('public/og.png gerado')
