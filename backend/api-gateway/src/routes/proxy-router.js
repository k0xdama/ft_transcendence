import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authGuard } from "../middleware/authGuard.js";

const authProxy = createProxyMiddleware({
	target: 'http://auth:3000',
	changeOrigin: true,
	pathRewrite: { '^/': '/auth/' },
});

const chatProxy = createProxyMiddleware({
	target: 'http://chat:2000',
	changeOrigin: true,
	pathRewrite: { '^/': '/chat/' }
});

const lobbyProxy = createProxyMiddleware({
	target: 'http://lobby:3003',
	ws: true,
	changeOrigin: true,
	pathRewrite: { '^/api/lobby': '' }
});

const gameProxy = createProxyMiddleware({
	target: 'http://game:3002',
	ws: true,
	changeOrigin: true,
	pathRewrite: { '^/api/game': '' }
});

function injectUserInfos(req, res, next) {
	req.headers['x-user-id'] = req.user.id;
	req.headers['x-user-username'] = req.user.username;
	req.headers['x-user-email'] = req.user.email;
	next();
}

const router = Router();

router.use('/auth', authProxy);
router.use('/chat', authGuard, injectUserInfos, chatProxy);
router.use('/lobby', lobbyProxy);
router.use('/game', gameProxy);

export { router, lobbyProxy, gameProxy };
