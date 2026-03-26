import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createGame, executeAction, nextPlayer } from './game-logic.js';
import { startGame } from './game-logic.js';
import { addPlayer } from './game-logic.js';
import { ACTIONS_NUMBER } from './game-logic.js';

//Remove process.env.JWT_SECRET when local test isn't needed anymore
const jwtSecret = process.env.JWT_SECRET || fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

const games = new Map();
const gameBySocket = new Map();

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

function endTurn(gameStruct, gameId) {
	gameStruct.cardsRevealed = [];
	gameStruct.currentAction = 'FIRST';
	gameStruct.pendingAcks = null;
	gameStruct.revealTimer = null;
	nextPlayer(gameStruct);
	io.to(gameId).emit('game:turnChanged', { gameStruct });
}

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
		const existingPlayer = gameStruct.players.find(player => player.id === socket.user.id);
		if (existingPlayer) {
			if (existingPlayer.connected === true) {
				socket.emit('error', 'Vous êtes déjà connecté à cette partie');
				return;
			}
			if (existingPlayer.turnTimer) {
				clearTimeout(existingPlayer.turnTimer);
				existingPlayer.turnTimer = null;
			}
			clearTimeout(existingPlayer.disconnectTimer);
			existingPlayer.connected = true;
			socket.join(data.gameId);
			gameBySocket.set(socket.id, data.gameId);
			socket.emit('game:reconnected', { gameStruct });
			socket.to(data.gameId).emit('game:playerReconnected', { userId : socket.user.id });
			return;
		}
		for (const player of gameStruct.players) {
			if (socket.user.id === player.id) {
				socket.emit('error', 'Vous avez déjà rejoint cette partie');
				return;
			}
		}
		socket.join(data.gameId);
		addPlayer(gameStruct, socket.user.id);
		io.to(data.gameId).emit('game:joined', { gameId: data.gameId });
		console.log(`Player ${socket.user.id} (client: ${socket.id}) joined the game ${data.gameId}`);
		gameBySocket.set(socket.id, data.gameId);
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
		if (action_result.winner != null) {
			io.to(data.gameId).emit('game:ended', action_result.winner);
			setTimeout(() => { games.delete(data.gameId); }, 5000);
		}
		else if (action_result.turnEnded) {
			gameStruct.pendingAcks = new Set();
			gameStruct.revealTimer = setTimeout(() => {
				endTurn(gameStruct, data.gameId);
			}, 7000);
		}
	});

	socket.on('game:check', (data) => {
		const gameStruct = games.get(data.gameId);
		if (!gameStruct || !gameStruct.pendingAcks)
			return;
		gameStruct.pendingAcks.add(socket.user.id);
		const connectedPlayers = gameStruct.players.filter(player => player.connected && !player.eliminated);
		if (gameStruct.pendingAcks.size === connectedPlayers.length) {
			clearTimeout(gameStruct.revealTimer);
			endTurn(gameStruct, data.gameId);
		}
	});

	socket.on('disconnect', () => {
		const gameId = gameBySocket.get(socket.id);
		if (gameId === undefined)
			return;
		const gameStruct = games.get(gameId);
		const playerIndex = gameStruct.players.findIndex(player => player.id === socket.user.id);
		const player = gameStruct.players[playerIndex];
		if (gameStruct.currentPlayerIndex === playerIndex) {
			if (gameStruct.revealTimer) {
				clearTimeout(gameStruct.revealTimer);
				gameStruct.revealTimer = null;
				gameStruct.pendingAcks = null;
			}
			player.turnTimer = setTimeout(() => {
				gameStruct.cardsRevealed = [];
				gameStruct.currentAction = ACTIONS_NUMBER.FIRST;
				nextPlayer(gameStruct);
				io.to(gameId).emit('game:update', { action_result: null, gameStruct });
			}, 15000);
		}
		player.connected = false;
		io.to(gameId).emit('game:playerDisconnected', { userId: socket.user.id });
		player.disconnectTimer = setTimeout(() => {
			player.eliminated = true;
			gameBySocket.delete(socket.id);
			io.to(gameId).emit('game:playerEliminated', { userId: socket.user.id });
			const activePlayers = gameStruct.players.filter(player => player.connected && !player.eliminated);
			if (activePlayers.length <= 1) {
				if (activePlayers.length === 1) {
					io.to(gameId).emit('game:ended', {winnerId: activePlayers[0].id, reason: 'FORFEIT'});
					setTimeout(() => {
						games.delete(gameId);
					}, 5000);
				}
				else {
					games.delete(gameId);
				}
			}
		}, 30000);
		console.log(`Client disconnected: ${socket.id}`);
	})
});