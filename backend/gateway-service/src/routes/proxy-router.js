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

router.use('/players', createProxyMiddleware({
	target: 'http://player:3001',//pour le http:// j'utilise player sans S pour le route j'utilise players avec S (pour etre restful c'est la norme le pluriel) mais je devrais peut etre toute mettre en maj
	changeOrigin: true,
	pathRewrite: { '^/': '/players/' },
}))

export { router }
const lobbyProxy = createProxyMiddleware({
	target: 'http://lobby:3003',
	ws: true,
	changeOrigin: true
});

const gameProxy = createProxyMiddleware({
	target: 'http://game:3002',
	ws: true,
	changeOrigin: true
});

router.use('/lobby', lobbyProxy);
router.use('/game', gameProxy);

export { router, lobbyProxy, gameProxy }
