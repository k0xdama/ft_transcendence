import express from 'express';
import fs from 'fs';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { router, lobbyProxy, gameProxy, chatWsProxy } from './src/routes/proxy-router.js';

const JWT_SECRET = fs.readFileSync('/run/secrets/jwt_access', 'utf8').trim();

function authenticateUpgrade(req) {
	const cookies = cookie.parse(req.headers.cookie || '');

	const accessToken = cookies.accessToken;
	if (!accessToken)
		throw new Error('Missing access token');

	return jwt.verify(accessToken, JWT_SECRET);
};

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	credentials: true
}));
app.use(cookieParser());
app.use('/api', router);

const server = createServer(app);

server.on('upgrade', (req, socket, head) => {
	try {
		const user = authenticateUpgrade(req);
		req.headers['x-user-id'] = user.id;
		req.headers['x-user-username'] = user.username;
		req.headers['x-user-email'] = user.email;
	} catch (err) {
		socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
		socket.destroy();
		return;
	}

	if (req.url.startsWith('/api/chat')) {
		chatWsProxy.upgrade(req, socket, head);
	} else if (req.url.startsWith('/api/lobby')) {
		lobbyProxy.upgrade(req, socket, head);
	} else if (req.url.startsWith('/api/game')) {
		gameProxy.upgrade(req, socket, head);
	} else {
		socket.destroy();
	}
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
	console.log(`GATEWAY running on port ${PORT}`)
});