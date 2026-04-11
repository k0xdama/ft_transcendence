import { defineConfig } from 'vite'
import fs from 'fs';
import react from '@vitejs/plugin-react'

const localKeyPath = '../secrets/ssl/key.pem'
const localCertPath = '../secrets/ssl/cert.pem'
const dockerKeyPath = '/run/secrets/ssl_key'
const dockerCertPath = '/run/secrets/ssl_cert'

const httpsConfig = fs.existsSync(dockerKeyPath) && fs.existsSync(dockerCertPath)
  ? {
      key: fs.readFileSync(dockerKeyPath),
      cert: fs.readFileSync(dockerCertPath),
    }
  : fs.existsSync(localKeyPath) && fs.existsSync(localCertPath)
    ? {
        key: fs.readFileSync(localKeyPath),
        cert: fs.readFileSync(localCertPath),
      }
    : undefined

//   const isDockerRuntime = fs.existsSync('/.dockerenv')
//   const apiProxyTarget = isDockerRuntime ? 'https://gateway:4000' : 'https://localhost:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	  host: '0.0.0.0',
    port: 5173,
    https: httpsConfig,
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