import express from 'express';
import { createServer } from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import chatRoutes from './src/routes/chat-router.js';
import { redisSubscriber, lobbyMembers } from './src/config/redis.js';
import { chatService } from './src/class/chat-service-class.js';

const sslOptions = {
	key: fs.readFileSync('/run/secrets/ssl_key'),
	cert: fs.readFileSync('/run/secrets/ssl_cert')
};

const app = express();

app.use(express.json());
app.use('/chat', chatRoutes);

const server = createServer(sslOptions, app);
const io = new Server(server);

// Auth: headers are injected by the API Gateway after JWT verification
io.use((socket, next) => {
	const userId = socket.handshake.headers['x-user-id'];
	const username = socket.handshake.headers['x-user-username'];
	if (!userId || !username)
		return next(new Error('Missing user identity headers'));
	socket.user = { id: userId, username };
	next();
});

io.on('connection', (socket) => {
	console.log(`Chat connected: ${socket.user.username} (${socket.id})`);

	// Personal room for DM events (read receipts, etc.)
	socket.join(`user:${socket.user.id}`);

	socket.on('chat:join', ({ lobbyId }) => {
		socket.join(lobbyId);
		console.log(`${socket.user.username} joined chat room ${lobbyId}`);
	});

	socket.on('chat:typing', ({ lobbyId }) => {
		socket.to(lobbyId).emit('chat:typing', { username: socket.user.username });
	});

	socket.on('chat:sound', ({ lobbyId, sound }) => {
		socket.to(lobbyId).emit('chat:sound', { sound, username: socket.user.username });
	});

	socket.on('dm:read', async ({ conversationId }) => {
		try {
			const { readCount, otherId } = await chatService.markDMsAsRead({
				conversationId,
				userId: socket.user.id
			});
			if (readCount > 0) {
				const readAt = new Date().toISOString();
				socket.emit('dm:read', { conversationId, readBy: socket.user.id, readAt });
				io.to(`user:${otherId}`).emit('dm:read', { conversationId, readBy: socket.user.id, readAt });
			}
		} catch (err) {
			console.error('dm:read error:', err.message);
		}
	});

	socket.on('disconnect', () => {
		console.log(`Chat disconnected: ${socket.user.username} (${socket.id})`);
	});
});

// Broadcast messages published to Redis to the relevant Socket.io room
await redisSubscriber.subscribe('chat:messages', (raw) => {
	const payload = JSON.parse(raw);
	io.to(payload.lobby_id).emit('chat:message', payload);
});

// Keep lobby membership in sync with lobby-service via Redis pub/sub
await redisSubscriber.subscribe('lobby:membersChanged', (raw) => {
	const { lobbyId, members } = JSON.parse(raw);
	if (members.length === 0)
		lobbyMembers.delete(lobbyId);
	else
		lobbyMembers.set(lobbyId, new Set(members));
});

// Broadcast online status changes to all connected chat clients
await redisSubscriber.subscribe('user:statusChanged', (raw) => {
	io.emit('user:statusChanged', JSON.parse(raw));
});

// Game notifications → broadcast to the relevant chat room
// TODO: uncomment when game-service publishes these Redis events
// await redisSubscriber.subscribe('lobby:gameStarting', (raw) => {
// 	const { lobbyId, gameId } = JSON.parse(raw);
// 	io.to(lobbyId).emit('chat:notification', {
// 		type: 'game_starting',
// 		lobbyId,
// 		gameId,
// 		message: 'The game is starting!'
// 	});
// });

// await redisSubscriber.subscribe('game:ended', (raw) => {
// 	const { gameId, winner } = JSON.parse(raw);
// 	io.to(gameId).emit('chat:notification', {
// 		type: 'game_ended',
// 		gameId,
// 		winner
// 	});
// });

const PORT = 2000;
server.listen(PORT, '0.0.0.0', () => {
	console.log(`CHAT-SERVICE running on ${PORT}`);
});
