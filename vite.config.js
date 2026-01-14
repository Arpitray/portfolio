import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // allow the Cloudflare tunnel host so Vite accepts requests proxied through it
    allowedHosts: [
      'viewpicture-shame-eligible-maryland.trycloudflare.com'
    ]
  }
})
