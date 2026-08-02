# joaowehner — site pessoal

Mini-site pessoal de João Wehner: portfólio, apresentação profissional, central de
links e cartão de visitas digital em estética de terminal editorial.

- **Referência visual**: interpretação autoral inspirada em <https://superdesign.dev/library/terminal>
- **Stack**: Vite · React 19 · TypeScript (strict) · CSS autoral com design tokens
- **Fontes**: Space Grotesk (texto/títulos) + JetBrains Mono (terminal/código), self-hosted via Fontsource
- **Deploy**: GitHub Pages via GitHub Actions

## Estrutura

```text
├── index.html                  # metadados, SEO, JSON-LD
├── public/                    # favicon, og.png, robots.txt, sitemap.xml
├── src/
│   ├── data/profile.ts        # ★ TODO o conteúdo do site (edite aqui)
│   ├── styles/tokens.css      # ★ design tokens (cores, tipos, espaçamento)
│   ├── styles/global.css      # reset, base, utilitários
│   ├── components/            # TopBar, Hero, Terminal, About, Projects,
│   │                          # Stack, LinksHub, Contact, Footer, CopyButton
│   ├── terminal/commands.ts   # lógica pura dos comandos (+ testes)
│   └── hooks/useActiveSection.ts
├── scripts/                   # revisão visual/interação/a11y (Playwright)
└── docs/                      # design-process, content-strategy, deployment
```

## Requisitos

- Node.js 20+ (desenvolvido com 24)
- npm

## Comandos

```bash
npm install        # dependências
npm run dev        # dev server em http://localhost:5173
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm test           # Vitest (lógica do terminal)
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
```

Scripts de revisão (exigem `npx playwright install chromium`):

```bash
node scripts/visual-review.mjs       # screenshots em 9 resoluções + overflow check
node scripts/interaction-review.mjs  # terminal, menu, navegação, links, clipboard
node scripts/a11y-review.mjs         # axe-core (WCAG AA)
node scripts/og-image.mjs            # regenera public/og.png
```

## Como editar o conteúdo

Tudo vive em [`src/data/profile.ts`](src/data/profile.ts):

- **Textos** (headline, bio, CTAs): campos `headline`, `subheadline`, `about`.
- **Adicionar projeto**: novo item em `projects` (a seção some se a lista ficar vazia).
- **Links/redes**: array `social` — `action: 'abrir'` vira botão de link,
  `action: 'copiar'` vira botão de copiar.
- **Stack**: grupos em `stack` (principal / experiência prática / explorando).
- **Currículo**: quando existir um PDF, adicione-o em `public/` e crie um item em
  `social` apontando para ele.

Comandos do terminal: [`src/terminal/commands.ts`](src/terminal/commands.ts) —
cada comando é um objeto `{ name, description, run }`; rode `npm test` após mudar.

Cores/tipografia/espaçamento: [`src/styles/tokens.css`](src/styles/tokens.css).

## Publicação no GitHub Pages

Ver [docs/deployment.md](docs/deployment.md). Resumo:

1. Crie o repositório **`joaowehner.github.io`** (site principal → URL raiz).
2. `git remote add origin … && git push -u origin main`.
3. Em *Settings → Pages*, selecione **GitHub Actions** como source.
4. O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) roda
   lint → typecheck → testes → build → deploy a cada push na `main`.

Para publicar como site de projeto (`joaowehner.github.io/<repo>`), defina
`VITE_BASE=/<repo>/` no build (comentado no workflow) e ajuste `canonical`,
`og:url`, `robots.txt` e `sitemap.xml` no `index.html`/`public/`.

### Checklist antes de publicar

- [ ] Confirmar publicação do e-mail pessoal no site
- [ ] Validar textos dos 3 projetos TSW
- [ ] Conferir `siteUrl` em `profile.ts` + canonical/OG no `index.html`
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` verdes
- [ ] Testar `npm run preview` localmente

### Domínio próprio (futuro)

Quando houver domínio: adicione `public/CNAME` com o domínio, configure o DNS
(CNAME → `joaowehner.github.io`) e atualize canonical/OG/sitemap. Detalhes em
[docs/deployment.md](docs/deployment.md).
