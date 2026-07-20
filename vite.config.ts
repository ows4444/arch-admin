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
    proxy: {
      '/auth': 'http://localhost:3000',
      '/validation-rules': 'http://localhost:3000',
    },
  },
})
