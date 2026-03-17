import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createGame, executeAction } from './game-logic.js';
import { startGame } from './game-logic.js';
import { addPlayer } from './game-logic.js';

//Remove process.env.JWT_SECRET when local test isn't needed anymore
const jwtSecret = process.env.JWT_SECRET || fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

const games = new Map();

const app  = express();
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

io.use((socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) return next(new Error('Token manquant'));
	try {
		const decoded = jwt.verify(token, jwtSecret);
		socket.user = decoded;
		next();
	} catch (e) {
		next(new Error('Token invalide'));
	}
});

app.post('/create', (req, res) => {
	const gameId = randomUUID();
	const gameStruct = createGame(gameId, req.body.gameMode, req.body.gameType, req.body.creatorId);
	gameStruct.expectedUsersIds = req.body.users;
	gameStruct.expectedPlayers = req.body.users.length;
	games.set(gameId, gameStruct);
	console.log(`Game created: ${gameId}`);
	res.json({ gameId });
});

server.listen(3002, () => {
	console.log('GAME-SERVICE started on port 3002');
});

io.on('connection', (socket) => {
	console.log(`Client connected: ${socket.id}`);

	socket.on('game:join', (data) => {
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `Aucune partie avec cet identifiant n'existe`);
			return;
		}
		if (!gameStruct.expectedUsersIds.includes(socket.user.id)) {
			socket.emit('error', `Vous n'êtes pas attendu dans cette partie`);
			return;
		}
		for (const player of gameStruct.players) {
			if (socket.user.id === player.id) {
				socket.emit('error', 'Vous avez déjà rejoint cette partie');
				return ;
			}
		}
		socket.join(data.gameId);
		addPlayer(gameStruct, socket.user.id);
		io.to(data.gameId).emit('game:joined', { gameId: data.gameId });
		console.log(`Player ${socket.user.id} (client: ${socket.id}) joined the game ${data.gameId}`);
		// console.log('players:', gameStruct.players.length, 'expected:', gameStruct.expectedPlayers);
		if (gameStruct.players.length === gameStruct.expectedPlayers) {
			startGame(gameStruct);
			io.to(data.gameId).emit('game:started', { gameStruct });
		}
	});

	socket.on('game:action', (data) => {
		console.log('game:action reçu', data);
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `La partie n'existe plus...Quelque chose a tourné au vinaigre...`);
			return;
		}
		if (socket.user.id !== gameStruct.currentPlayer) {
			socket.emit('error', `Ce n'est pas ton tour !`);
			return;
		}
		const action_result = executeAction(gameStruct, data.actionType, data.target);
		io.to(data.gameId).emit('game:update', { action_result, gameStruct });
	});

	socket.on('disconnect', () => {
		console.log(`Client disconnected: ${socket.id}`);
	})
});