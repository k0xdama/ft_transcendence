import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authGuard } from "../middleware/authGuard.js";

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth:3000';
const PLAYER_URL = process.env.PLAYER_SERVICE_URL || 'http://player:3001';
const CHAT_URL = process.env.CHAT_SERVICE_URL || 'http://chat:2000';
const LOBBY_URL = process.env.LOBBY_SERVICE_URL || 'http://lobby:3003';
const GAME_URL = process.env.GAME_SERVICE_URL || 'http://game:3002';

const authProxy = createProxyMiddleware({
	target: AUTH_URL,
	changeOrigin: true,
	pathRewrite: { '^/': '/auth/' },
});

// pour le http:// j'utilise player sans S pour le route j'utilise players avec S (pour etre restful c'est la norme le pluriel) mais je devrais peut etre toute mettre en maj
const playerProxy = createProxyMiddleware({
	target: PLAYER_URL,
	changeOrigin: true,
	pathRewrite: { '^/': '/players/' },
});

const chatProxy = createProxyMiddleware({
	target: CHAT_URL,
	changeOrigin: true,
	pathRewrite: { '^/': '/chat/' }
});

// Separate WS proxy for chat Socket.io upgrades
const chatWsProxy = createProxyMiddleware({
	target: CHAT_URL,
	ws: true,
	changeOrigin: true,
	pathRewrite: { '^/api/chat': '' }
});

const lobbyProxy = createProxyMiddleware({
	target: LOBBY_URL,
	ws: true,
	changeOrigin: true,
	pathRewrite: { '^/api/lobby': '' }
});

const gameProxy = createProxyMiddleware({
	target: GAME_URL,
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
router.use('/players', playerProxy, injectUserInfos); // voir si ajouter injectUserInfos (normalement oui)
router.use('/chat', authGuard, injectUserInfos, chatProxy);
router.use('/lobby', authGuard, injectUserInfos, lobbyProxy);
router.use('/game', authGuard, injectUserInfos, gameProxy);

export { router, lobbyProxy, gameProxy, chatWsProxy };
