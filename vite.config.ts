import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The Arch API doesn't send CORS headers, so cross-origin calls from the
    // dev server get blocked by the browser. Proxying same-origin sidesteps
    // that in dev; production still needs the backend to allow this app's
    // deployed origin (see ARCH.md "Design 001").
    //
    // Proxied under /api (stripped before forwarding) rather than proxying
    // each backend path (/auth, /validation-rules, ...) directly — a direct
    // proxy prefix collides with any frontend page route of the same name
    // (e.g. the /validation-rules page) and swallows full-page navigations,
    // reloads, and bookmarks. See entities/validation-rule/ARCH.md.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
