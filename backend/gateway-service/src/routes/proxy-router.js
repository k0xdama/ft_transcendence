import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authGuard } from "../middleware/authGuard.js";

const router = Router()

router.use('/auth', createProxyMiddleware({
	target: 'http://auth:3000',
	changeOrigin: true,
	pathRewrite: { '^/': '/auth/' },
	on: {
		proxyReq: (proxyReq, req) => {
			console.log(`[PROXY] ${req.method} ${req.path} → ${proxyReq.path}`)
			console.log(`[PROXY] cookies:`, req.headers.cookie)
		}
	}
}))

router.use('/chat', authGuard, createProxyMiddleware({
	target: 'http://chat:2000',
	changeOrigin: true,
	pathRewrite: { '^/': '/chat/' }
}))

export { router }
