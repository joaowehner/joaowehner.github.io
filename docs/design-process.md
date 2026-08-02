# Processo de design

## Skills e ferramentas aplicadas (com efeito verificável)

| Skill/Ferramenta | Fase | Efeito concreto no projeto |
|---|---|---|
| caveman (lite) | toda a sessão | comunicação enxuta; economia de tokens direcionada a pesquisa/revisão |
| Pesquisa de perfis (WebFetch/WebSearch + browser autenticado) | descoberta | headline, cargo, localização e projetos extraídos de LinkedIn/Instagram/GitHub reais — zero conteúdo inventado |
| motion-design | sistema visual | tokens `--t-fast: 140ms`/`--t-base: 240ms` + easing padrão; transições só para feedback de estado (hover, cópia, aba ativa); `prefers-reduced-motion` global |
| Playwright (visual-review.mjs) | revisão ciclos 1–3 | screenshots nas 9 resoluções + detector automático de overflow |
| Playwright (interaction-review.mjs) | validação | 17 testes: terminal, autocomplete, histórico, clear, navegação, menu mobile, clipboard, links externos |
| axe-core | acessibilidade | 1 violação encontrada (contraste `--text-3`) e corrigida; revalidado: 0 violações |
| Vitest | qualidade | 12 testes da lógica pura do terminal |
| Workflow multi-agente | conselho de revisão | 6 revisores independentes (Product/UI/UX/Frontend/A11y/Branding) + verificação adversarial dos achados |

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

Conselho multi-agente: 36 achados brutos → 26 confirmados por verificação
adversarial + 8 baixos. Todos os aplicáveis corrigidos:

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

## Critérios de aprovação final

- Zero overflow nas 9 resoluções; zero erros de console; axe 0 violações;
  lint/typecheck/testes/build verdes; links externos verificados; nenhum dado
  inventado (fontes na matriz de `content-strategy.md`).
