# Terminal Portfolio — João Guilherme W. Ricartes

Aplicação web profissional de portfólio interativo com interface baseada em linha de comando (*Terminal UI*). O projeto combina estética retro-moderna com uma arquitetura de software moderna, performática e modular.

- **Interface Visual**: Design autoral inspirado em ambientes CLI (referência: [superdesign.dev/library/terminal](https://superdesign.dev/library/terminal))
- **Tech Stack**: Vite · React 19 · TypeScript (Strict Mode) · CSS autoral com Design Tokens
- **Tipografia**: Space Grotesk (Textos e Títulos) + JetBrains Mono (Terminal e Código), *self-hosted* via `@fontsource`
- **Automação & CI/CD**: GitHub Actions para testes e deploy automatizado no GitHub Pages
- **Qualidade & Acessibilidade**: Testes unitários (Vitest) e testes automatizados de regressão visual, interação e acessibilidade (Playwright + axe-core)

---

## 📁 Estrutura do Projeto

```text
├── index.html                  # Metadados SEO, Open Graph e dados estruturados (JSON-LD)
├── public/                    # Assets estáticos (Favicon, OG Image, robots.txt, sitemap.xml)
├── src/
│   ├── data/profile.ts        # Fonte da verdade dos dados (perfil, projetos, stack e links)
│   ├── styles/tokens.css      # Design Tokens (variáveis de cor, tipografia e espaçamento)
│   ├── styles/global.css      # Reset CSS, estilos base e utilitários
│   ├── components/            # Componentes React (TopBar, Hero, Terminal, Projects, etc.)
│   ├── terminal/commands.ts   # Motor de execução e lógica pura dos comandos do terminal
│   └── hooks/useActiveSection.ts # Hook customizado para navegação e estado de seções
├── scripts/                   # Automação de testes visuais, interação e acessibilidade (Playwright)
└── docs/                      # Documentação de arquitetura, estratégia e deploy
```

---

## ⚙️ Pré-requisitos

- **Node.js**: v20+ (recomendado v24+)
- **Gerenciador de pacotes**: npm (v10+)

---

## 🚀 Scripts Disponíveis

### Desenvolvimento e Build

```bash
# Instalação das dependências
npm install

# Inicia o servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Análise estática de código (ESLint)
npm run lint

# Checagem estática de tipos (TypeScript)
npm run typecheck

# Executa os testes unitários (Vitest)
npm test

# Gera o build otimizado para produção em /dist
npm run build

# Visualiza o build de produção localmente
npm run preview
```

### Scripts de Validação Automatizada (QA)

> *Nota: Requer a instalação dos executáveis do navegador: `npx playwright install chromium`*

```bash
# Screenshots de regressão visual em 9 resoluções + checagem de overflow
node scripts/visual-review.mjs

# Validação de interações (terminal, menus, navegação, clipboard)
node scripts/interaction-review.mjs

# Teste automatizado de acessibilidade (axe-core / WCAG AA)
node scripts/a11y-review.mjs

# Regenera a imagem Open Graph (public/og.png)
node scripts/og-image.mjs
```

---

## 📝 Gestão de Conteúdo

Todo o conteúdo exibido na aplicação é orientado a dados e centralizado no arquivo [`src/data/profile.ts`](src/data/profile.ts):

- **Informações Pessoais & Bio**: Atualize os campos `headline`, `subheadline` e `about`.
- **Projetos**: Gerenciados no array `projects` (a seção adapta-se dinamicamente caso o array esteja vazio).
- **Links & Redes Sociais**: Configurados no array `social`, suportando ações de navegação (`action: 'abrir'`) ou cópia para a área de transferência (`action: 'copiar'`).
- **Comandos do Terminal**: Gerenciados em [`src/terminal/commands.ts`](src/terminal/commands.ts). Cada comando aceita o formato `{ name, description, run }`.
- **Estilização & Temas**: Altere variáveis globais de design em [`src/styles/tokens.css`](src/styles/tokens.css).

---

## 🌐 Deploy e Publicação

Consulte o guia completo em [docs/deployment.md](docs/deployment.md).

### Publicação em Repositório GitHub Pages

1. Crie o repositório **`joaowehner.github.io`** para deploy na raiz do domínio.
2. Adicione o remoto e faça o push da branch principal:
   ```bash
   git remote add origin git@github.com:joaowehner/joaowehner.github.io.git
   git push -u origin main
   ```
3. Em **Settings → Pages** do repositório, defina a origem (**Source**) como **GitHub Actions**.
4. O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) executará automaticamente os passos de `lint` $\rightarrow$ `typecheck` $\rightarrow$ `tests` $\rightarrow$ `build` $\rightarrow$ `deploy`.

*Para publicar como subcaminho (`joaowehner.github.io/<repo>`), configure a variável `VITE_BASE=/<repo>/` durante a etapa de build e ajuste os caminhos canônicos no `index.html`.*

### Checklist de Release

- [ ] Validar a integridade das informações de contato e links em `src/data/profile.ts`.
- [ ] Garantir que URLs de metadados (`siteUrl`, Open Graph e Canonical Tags) estejam corretas.
- [ ] Executar o pipeline de validação local:
  ```bash
  npm run lint && npm run typecheck && npm test && npm run build
  ```
- [ ] Validar a renderização final com `npm run preview`.

---

## 📄 Licença

Este projeto é de código aberto sob a licença MIT. Sinta-se à vontade para utilizar a estrutura como base para o seu próprio portfólio.
