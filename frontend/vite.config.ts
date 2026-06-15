import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const defaultBackendUrl =
  'http://ecommerceproject-env.eba-kesmjpp4.eu-north-1.elasticbeanstalk.com'

// Local dev: Vite proxies frontend requests to the backend.
// The browser calls /api and /images on localhost, and Vite forwards
// them to VITE_BACKEND_URL (AWS by default).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl =
    env.VITE_BACKEND_URL || env.VITE_API_URL || defaultBackendUrl

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/images': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
