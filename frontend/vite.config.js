import { defineConfig } from 'vite'
import fs from 'fs';
import react from '@vitejs/plugin-react'

const httpsConfig = fs.existsSync('../secrets/key.pem') ? {
  key: fs.readFileSync('../secrets/key.pem'),
  cert: fs.readFileSync('../secrets/cert.pem'),
} : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	  host: '0.0.0.0',
    port: 5173,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'https://localhost:4000',
	    	ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  test: {
    environment: 'jsdom'
  }
})
