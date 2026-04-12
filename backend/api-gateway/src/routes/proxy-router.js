import { Router } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authGuard } from "../middleware/authGuard.js";

const AUTH_URL = process.env.AUTH_URL || 'https://auth:3000';
const PLAYER_URL = process.env.PLAYER_URL || 'https://player:3001';
const CHAT_URL = process.env.CHAT_URL || 'https://chat:2000';
const LOBBY_URL = process.env.LOBBY_URL || 'https://lobby:3003';
const GAME_URL = process.env.GAME_URL || 'https://game:3002';

/*
	─── HTTP Proxies ─────────────────────────────────────────────────────────

	HTTP proxies (auth, player, chat): router.use('/chat', ...) already strips
	the /chat prefix, so the proxy only receives the remainder and pathRewrite
	prepends the backend service namespace.
*/
const authProxy = createProxyMiddleware({
	target: AUTH_URL,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/': '/auth/' },
	onError: (err, req, res) => {
        console.error('Auth proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
    }
});

// pour le http:// j'utilise player sans S pour le route j'utilise players avec S (pour etre restful c'est la norme le pluriel) mais je devrais peut etre toute mettre en maj
const playerProxy = createProxyMiddleware({
	target: PLAYER_URL,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/': '/players/' },
	onError: (err, req, res) => {
        console.error('Player proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
    }
});

const chatProxy = createProxyMiddleware({
	target: CHAT_URL,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/': '/chat/' },
	onError: (err, req, res) => {
        console.error('Chat proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
    }
});

/*
	─── WebSocket Proxies ────────────────────────────────────────────────────

	WS proxies (chatWs, lobby, game): WebSocket upgrades don't go through the
	Express router the same way — they receive the full path /api/lobby/...,
	so pathRewrite: { '^/api/lobby': '' } strips the entire prefix to reach the
	service root.
*/
const chatWsProxy = createProxyMiddleware({
	target: CHAT_URL,
	ws: true,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/api/chat': '' },
	onError: (err, req, res) => {
        console.error('ChatWs proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
    }
});

const lobbyProxy = createProxyMiddleware({
	target: LOBBY_URL,
	ws: true,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/api/lobby': '' },
	onError: (err, req, res) => {
        console.error('Lobby proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
    }
});

const gameProxy = createProxyMiddleware({
	target: GAME_URL,
	ws: true,
	changeOrigin: true,
	secure: false,
	pathRewrite: { '^/api/game': '' },
	onError: (err, req, res) => {
        console.error('Game proxy error:', err.message);
        res.status(502).json({ error: 'Service unavailable' });
	}
});

// ─── Middleware ────────────────────────────────────────────────────────────
function injectUserInfos(req, res, next) {
	req.headers['x-user-id'] = req.user.id;
	req.headers['x-user-username'] = req.user.username;
	req.headers['x-user-email'] = req.user.email;
	next();
}

// ─── Route Mounting ───────────────────────────────────────────────────────
const router = Router();

router.use('/auth', authProxy);
router.use('/players', authGuard, injectUserInfos, playerProxy);
router.use('/chat', authGuard, injectUserInfos, chatProxy);
router.use('/lobby', authGuard, injectUserInfos, lobbyProxy);
router.use('/game', authGuard, injectUserInfos, gameProxy);

export { router, chatWsProxy, lobbyProxy, gameProxy };
