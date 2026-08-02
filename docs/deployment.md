# Deployment — GitHub Pages

## Modelo escolhido

**Site principal**: repositório `joaowehner.github.io` → publicado em
`https://joaowehner.github.io/` com `base: '/'` (default do `vite.config.ts`).

## Configuração

1. Criar repositório público `joaowehner.github.io` na conta `joaowehner`.
2. Apontar o remoto e enviar:

   ```bash
   git remote add origin https://github.com/joaowehner/joaowehner.github.io.git
   git push -u origin main
   ```

3. GitHub → repositório → **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
4. Cada push na `main` dispara `.github/workflows/deploy.yml`:
   `npm ci` → lint → typecheck → testes → build → `actions/deploy-pages`.
   Falhou qualquer etapa → não publica.

## Site de projeto (alternativa)

Se o repositório NÃO se chamar `joaowehner.github.io`, a URL vira
`https://joaowehner.github.io/<repo>/`. Nesse caso:

- No workflow, descomente o bloco `env: VITE_BASE: /${{ github.event.repository.name }}/`.
- Atualize `canonical`, `og:url`, `og:image`, `twitter:image` no `index.html`.
- Atualize `public/robots.txt` (URL do sitemap) e `public/sitemap.xml` (`<loc>`).
- Atualize `siteUrl` em `src/data/profile.ts`.

## HTTPS e fallback

- GitHub Pages serve HTTPS automaticamente (marcar *Enforce HTTPS*).
- SPA de página única sem rotas: não precisa de `404.html` custom.

## Rollback

- Reverter o commit problemático (`git revert <sha>`) e fazer push — o workflow
  republica a versão anterior.
- Alternativa: *Actions → run anterior → Re-run all jobs*.

## Domínio próprio (quando existir)

1. Criar `public/CNAME` contendo apenas o domínio (ex.: `joaowehner.dev`).
2. DNS: `CNAME www → joaowehner.github.io` (e/ou apex via registros `A/AAAA`
   do GitHub Pages).
3. Settings → Pages → Custom domain → preencher e aguardar o certificado.
4. Atualizar canonical/OG/sitemap/`siteUrl` para o novo domínio.

**Não criar `CNAME` antes de o domínio existir** — quebra o deploy.
