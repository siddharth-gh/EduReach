/* eslint-disable no-undef */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrHost = env.VITE_HMR_HOST
  const disableHmr = env.VITE_DISABLE_HMR === 'true'

  return {
    plugins: [react()],
    server: {
      host: true,
      hmr: disableHmr
        ? false
        : hmrHost
        ? {
            host: hmrHost,
            clientPort: Number(env.VITE_HMR_PORT || 5173),
            protocol: env.VITE_HMR_PROTOCOL || 'ws',
          }
        : undefined,
    },
  }
})
