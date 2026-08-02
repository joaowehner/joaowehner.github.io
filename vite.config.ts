import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' serve o site principal (joaowehner.github.io).
// Para publicar como site de projeto (joaowehner.github.io/<repo>),
// defina VITE_BASE='/<repo>/' no build — ver docs/deployment.md.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
})
