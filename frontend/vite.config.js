import { defineConfig } from 'vite'
import fs from 'fs';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	  host: '0.0.0.0',
    port: 5173,
    https: {
        key: fs.readFileSync('/run/secrets/ssl_key'),
        cert: fs.readFileSync('/run/secrets/ssl_cert'),
    },
    proxy: {
      '/api': {
        target: 'https://gateway:4000',
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
