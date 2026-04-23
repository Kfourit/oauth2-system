import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    env: {
      VITE_AUTH_SERVER_URL: 'http://localhost:9000',
      VITE_CLIENT_ID: 'test-client',
      VITE_REDIRECT_URI: 'http://localhost:3000/callback',
      VITE_RESOURCE_SERVER_URL: 'http://localhost:8080',
    },
  },
})
