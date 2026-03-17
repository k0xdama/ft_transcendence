import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { authGuard } from "../middleware/authGuard.js";

const router = Router()

router.use('/auth', createProxyMiddleware({
	target: 'http://auth:3000',
	changeOrigin: true,
	pathRewrite: { '^/': '/auth/' },
}))

router.use('/chat', authGuard, createProxyMiddleware({
	target: 'http://chat:2000',
	changeOrigin: true,
	pathRewrite: { '^/': '/chat/' }
}))

export { router }
