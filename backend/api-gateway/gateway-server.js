import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import { router, lobbyProxy, gameProxy } from './src/routes/proxy-router.js'

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));
app.use(cookieParser());
app.use('/api', router);

const server = createServer(app);

server.on('upgrade', (req, socket, head) => {
	if (req.url.startsWith('/api/lobby')) {
		lobbyProxy.upgrade(req, socket, head);
	}
	else if (req.url.startsWith('/api/game')) {
		gameProxy.upgrade(req, socket, head);
	}
	else {
		socket.destroy();
	}
});

server.listen(PORT, () => {
	console.log(`Gateway running on port ${PORT}`)
});
