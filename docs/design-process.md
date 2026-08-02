# Processo de design

## Método e ferramentas de validação

| Etapa | Ferramenta | Efeito verificável no projeto |
|---|---|---|
| Descoberta | pesquisa dos perfis públicos (LinkedIn, GitHub, Instagram) | headline, cargo, localização e projetos extraídos das fontes reais — zero conteúdo inventado |
| Sistema visual | princípios de motion design | tokens `--t-fast: 140ms`/`--t-base: 240ms` + easing padrão; transições só para feedback de estado (hover, cópia, aba ativa) |
| Revisão visual (ciclos 1–3) | Playwright — `visual-review.mjs` | screenshots nas 9 resoluções + detector automático de overflow |
| Validação funcional | Playwright — `interaction-review.mjs` | 17 testes: terminal, autocomplete, histórico, clear, navegação, menu mobile, clipboard, links externos |
| Acessibilidade | axe-core — `a11y-review.mjs` | 1 violação encontrada (contraste `--text-3`) e corrigida; revalidado: 0 violações |
| Testes unitários | Vitest | 12 testes da lógica pura do terminal |
| Revisão final | conselho de revisão em 6 perspectivas (Product, UI, UX, Frontend, Acessibilidade, Marca) | achados verificados um a um contra o código e as capturas antes de virar correção |

## Direção visual

Duas direções foram consideradas dentro do conceito terminal:

### A — Terminal editorial minimalista ✅ escolhida

Tipografia como protagonista, um único terminal interativo como peça de identidade,
muito respiro, superfícies escuras com diferenças sutis, um só verde de destaque.
**Por quê**: com conteúdo enxuto (3 projetos, perfil em construção), uma interface
densa estilo IDE ficaria vazia e artificial. A direção editorial valoriza o texto
de posicionamento — que é o ativo mais forte do João (sócio + mercado específico).

### B — Terminal técnico estilo IDE ❌ descartada

Abas, árvore de arquivos, painéis, status bar rica. Vantagem: mais "wow" técnico.
Riscos que motivaram o descarte: densidade sem conteúdo para sustentá-la, mais
manutenção, usabilidade pior em mobile, maior chance de parecer template/gimmick.

## Sistema de design

Tudo em `src/styles/tokens.css`:

- **Cores**: fundo grafite azulado `#0a0d12`; 4 níveis de superfície; 3 níveis de
  texto (todos ≥ AA sobre os fundos usados); destaque único verde `#3ecf8e` com
  variações (strong/tint); âmbar e ciano como cores de apoio raras; vermelho só
  para erro no terminal.
- **Tipografia**: Space Grotesk Variable (títulos/corpo) + JetBrains Mono Variable
  (terminal, navegação, metadados, chips). Escala: 12/13/15/17/20 + `clamp()` para
  títulos (h2 até 36px, hero até ~58px).
- **Espaçamento**: escala base-4 (4→96px) em `--space-1..9`; seções com 4rem
  vertical; container de 1120px.
- **Forma**: raios 6/10/14px; bordas 1px `#1c2634`; sombras profundas apenas em
  janelas (terminal, cards de destaque); brilho ambiente sutil no topo da página.
- **Movimento**: 140ms (micro) / 240ms (estrutural), `cubic-bezier(0.4,0,0.2,1)`;
  cursor de bloco piscando na marca; tudo desligável via `prefers-reduced-motion`.

## Linguagem "terminal como metáfora, não barreira"

- Cabeçalhos de seção = comandos (`cat about.md`, `ls ~/projects`, `cat stack.json`).
- Cards de projeto = janelas com caminho `~/projects/...` + status chip.
- Navegação = `./secao` com item ativo sublinhado.
- Rodapé = linha de status.
- Terminal interativo real no hero — mas **todo o conteúdo existe em HTML
  convencional**; nenhuma informação depende do terminal.

## Ciclos de revisão visual

### Ciclo 1 — estrutura (screenshots `c1`)
Problemas encontrados e corrigidos:
1. **Overflow horizontal mobile** (`.links__row` 393px em viewport 360/390):
   grid item com `min-width: auto` + handle `nowrap`. Fix: `minmax(0,1fr)` +
   `min-width: 0`. Detectado pelo overflow-checker; revalidado: zero overflow.
2. **Nav destacava "./sobre" no topo da página**: estado inicial do
   `useActiveSection`. Fix: hook reescrito com Set de seções visíveis; no hero
   nenhum item ativo.
3. **Faixa morta entre hero e Sobre**: `min-height: 100svh` sem teto + seções com
   6rem duplo. Fix: teto de `54rem` no hero, seções para 4rem.
4. **Terminal com área vazia alta**: `min-height` 15rem → 13rem.

### Ciclo 2 — refinamento (screenshots `c2`)
- 17/17 testes de interação passam; console 100% limpo em 9 viewports.
- axe-core: contraste de `--text-3` reprovado (3,6:1) → token clareado para
  `#6e7f95` (≈4,8:1) → 0 violações.

### Ciclo 3 — produção (screenshots `c3`)

Conselho de revisão em 6 perspectivas: 36 achados brutos → 26 confirmados por
verificação adversarial contra o código e as capturas + 8 de severidade baixa.
Todos os aplicáveis corrigidos:

**Conversão e conteúdo**
- Hero sem caminho para contato → CTA "Vamos conversar" (#contato) como
  secundário; GitHub virou ghost; LinkedIn órfão do mobile eliminado.
- Terminal do hero repetia o hero verbatim (whoami) → estado inicial virou
  teaser `ls ~/projects` com os 4 projetos e status.
- Stack prometida sem evidência nos projetos → subheadline reescrito (honesto,
  "no dia a dia") + 4º projeto "Este site" (React 19 + TS, Lighthouse real).
- Sobre repetia hero e stack 3× → reescrito com o ângulo sócio/negócio e o
  inventário real ("dois sites, uma integração, fluxos com IA").
- "Código aberto" sem link → alegação removida até o repositório ser público.
- Card 1 renomeado ("TSW — Site institucional", "da qual sou sócio").

**Bugs e UX**
- Menu mobile quebrado (backdrop-filter criava containing block do fixed) →
  blur movido para ::before; painel com 100dvh, fundo sólido, overflow.
- Scroll travado ao rotacionar com menu aberto → matchMedia fecha o menu.
- Menu sem contenção de foco → `inert` em main/footer + foco devolvido ao botão.
- Armadilha de Tab no input do terminal → Shift+Tab/campo vazio passam livres.
- `help` nascia cortado (auto-scroll ao fundo) → rola ao início de respostas
  altas; max-height 26rem em ≥1280px.
- Toque no terminal abria teclado virtual → foco só com `pointer: fine`.
- Alvos de toque <44px (chips, botão menu) → min-height 44px em touch.
- `scrollIntoView` smooth ignorava reduced-motion → respeita a preferência.
- CopyButton mudava de largura ao copiar → dois rótulos sobrepostos em grid.
- Nome acessível genérico "copiar" → aria-label com contexto.
- Card órfão de meia largura na grade → grade 2×2 + ímpar final em linha cheia.
- Links a 640px quebrava o ritmo → 2 colunas ≥861px, e-mail em linha cheia.
- Offset duplo de âncora (8rem) → só scroll-padding-top.
- Skip-link apontava para #sobre → main#conteudo com tabIndex -1.
- clear deixava caixa morta → re-semeia a dica de uso.
- deploy.yml cancel-in-progress → false (não aborta deploy no meio).
- Marca hardcoded → TopBar e Terminal leem profile.brand.

**Não aplicado (exige dado real do João — pendência, não fabricado)**: métricas
e datas nos projetos (nº de origens de leads, ano de lançamento).

Validação final: lint ✓ · typecheck ✓ · 12 testes ✓ · build ✓ · 17/17
interações ✓ · axe 0 violações ✓ · zero overflow e console limpo nas 9
resoluções ✓ · **Lighthouse 99 · 100 · 100 · 100**.

## Introdução cinematográfica ("ssh joaowehner@web")

Sequência de boot autoral exibida uma vez por sessão, antes da primeira dobra.
Personalidade **premium**: easing `cubic-bezier(0.4,0,0.2,1)` (o `--ease` do
site), zero overshoot, só transform/opacity.

**Narrativa em cinco atos (~5,7s, pulável a qualquer momento):**

1. *Vazio* (0–0,5s) — cursor de bloco piscando sozinho no escuro.
2. *Comando* (0,5–1,8s) — `❯ ssh joaowehner@web` digita sozinho (70ms/char),
   ecoando o título real da janela do terminal do site.
3. *Resposta* (2,1–3,1s) — três linhas de verificação com leader pontilhado e
   `ok` verde chegando 150ms após cada linha (stagger 320ms); o glow ambiente
   floresce em 2s — **o mesmo gradiente do `body::before` do site**, para a
   costura da saída ser invisível.
4. *Revelação* (3,4–4,6s) — nome sobe por clip reveal (600ms), papel em mono
   verde 200ms depois; prompt e status esmaecem a 35% (staging).
5. *Saída* (5,0–5,7s) — cortina acelera (`0.3,0,1,1`); o hero sobe ao encontro
   em stagger de 60ms por elemento (terminal 240ms depois).

**Decisões de craft registradas:**
- Alturas da identidade reservadas desde o 1º frame — o palco nunca salta
  (defeito de ~64px detectado em captura e corrigido).
- Glow com os mesmos alphas do site (0,05/0,04) — versões mais fortes criavam
  banding visível em fundo escuro.
- Sem autofoco no botão "pular" — o anel de foco poluía o ato contemplativo;
  Esc/Enter funcionam via listener global.
- Skip: botão `pular [esc]` visível a partir de 600ms, saída rápida de 320ms.
- Gating por `sessionStorage` (uma vez por sessão); `main` fica `inert` sob a
  intro; scroll travado durante a exibição.
- **Decisão do dono (02/08/2026)**: `prefers-reduced-motion` removido de todo o
  site — animações sempre ativas. Registrado como escolha consciente do João,
  contra a recomendação WCAG 2.3.3.

**Validação**: suite própria (`scripts/intro-review.mjs`, 9 cenários — fases,
skip por botão e Esc, gating de sessão, hero após handoff, erros de página) +
frames capturados de cada ato. Lighthouse com a intro ativa: 99·100·100·100,
LCP 1,7s, CLS 0. Custo no bundle: ~1 kB gzip.

## Critérios de aprovação final

- Zero overflow nas 9 resoluções; zero erros de console; axe 0 violações;
  lint/typecheck/testes/build verdes; links externos verificados; nenhum dado
  inventado (fontes na matriz de `content-strategy.md`).
