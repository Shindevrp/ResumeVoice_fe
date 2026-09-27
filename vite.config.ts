import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import type { UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  const configured = env.VITE_RESUME_VOICE_API_URL || env.VITE_RESUME_VOICE_SIGNAL_URL
  const target = configured ? new URL(configured) : null
  if (target) target.protocol = target.protocol === 'wss:' || target.protocol === 'https:' ? 'https:' : 'http:'
  return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: target ? {
      '/resumevoice-api': {
        target: target.origin,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/resumevoice-api/, ''),
      },
    } : {},
  },
  }
})
