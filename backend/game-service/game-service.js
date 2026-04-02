import express from 'express';
import fs from 'fs';
import { createClient } from 'redis';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import {
	createGame,
	addPlayer,
	nextPlayer,
	startGame,
	executeAction,
	buildGameStats,
	ACTIONS_NUMBER } from './game-logic.js';

const games = new Map();
const gameBySocket = new Map();
const playersTimers = new Map();
const gameTimers = new Map();

const app = express();
app.use(express.json());

const server = createServer(app);
const io = new Server(server);

const redisPassword = fs.readFileSync('/run/secrets/redis_passwd', 'utf-8').trim();

const redisClient = createClient({
	socket: { host: 'redis', port: 6379 },
	password: redisPassword
});
redisClient.connect();

io.use((socket, next) => {
	const userId = socket.handshake.headers['x-user-id'];
	const username = socket.handshake.headers['x-user-username'];
	if (!userId || !username) {
		return next(new Error('Missing user identity headers'));
	}
	socket.user = { id: userId, username: username };
	next();
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
	console.log('GAME-SERVICE running on port 3002');
});

function endTurn(gameStruct, gameId) {
	gameStruct.cardsRevealed = [];
	gameStruct.currentAction = 'FIRST';
	gameTimers.delete(gameId);
	nextPlayer(gameStruct);
	io.to(gameId).emit('game:turnChanged', { gameStruct });
}

function setPlayerTimer(userId, timerName, timer) {
	if (!playersTimers.has(userId))
		playersTimers.set(userId, {});
	playersTimers.get(userId)[timerName] = timer;
}

function clearPlayerTimer(userId, timerName) {
	const timers = playersTimers.get(userId);
	if (timers && timers[timerName]) {
		clearTimeout(timers[timerName]);
		timers[timerName] = null;
	}
}

io.on('connection', (socket) => {
	console.log(`Client connected (${socket.user.username}): ${socket.id}`);

	socket.on('game:join', (data) => {
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `No game with that ID exists`);
			return;
		}
		if (!gameStruct.expectedUsersIds.includes(socket.user.id)) {
			socket.emit('error', `You're not expected here`);
			return;
		}
		const existingPlayer = gameStruct.players.find(player => player.id === socket.user.id);
		if (existingPlayer) {
			if (existingPlayer.connected === true) {
				socket.emit('error', 'You are already logged in to this game');
				return;
			}
			clearPlayerTimer(existingPlayer.id, 'turnTimer');
			clearPlayerTimer(existingPlayer.id, 'disconnectTimer');
			existingPlayer.connected = true;
			socket.join(data.gameId);
			gameBySocket.set(socket.id, data.gameId);
			socket.emit('game:reconnected', { gameStruct });
			socket.to(data.gameId).emit('game:playerReconnected', { userId : socket.user.id });
			return;
		}
		for (const player of gameStruct.players) {
			if (socket.user.id === player.id) {
				socket.emit('error', 'You have already joined this game');
				return;
			}
		}
		socket.join(data.gameId);
		addPlayer(gameStruct, socket.user.id);
		io.to(data.gameId).emit('game:joined', { gameId: data.gameId });
		console.log(`${socket.user.username} (client: ${socket.id}) joined the game ${data.gameId}`);
		gameBySocket.set(socket.id, data.gameId);
		// console.log('players:', gameStruct.players.length, 'expected:', gameStruct.expectedPlayers);
		if (gameStruct.players.length === gameStruct.expectedPlayers) {
			startGame(gameStruct);
			io.to(data.gameId).emit('game:started', { gameStruct });
		}
	});

	socket.on('game:action', async (data) => {
		console.log('game:action received', data);
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `Something went wrong... The game is over...`);
			return;
		}
		if (socket.user.id !== gameStruct.currentPlayer) {
			socket.emit('error', `Don't you dare! That is not your turn!`);
			return;
		}
		const action_result = executeAction(gameStruct, data.actionType, data.target);
		io.to(data.gameId).emit('game:update', { action_result, gameStruct });
		if (action_result.winner != null) {
			const stats = buildGameStats(gameStruct, action_result.winner.winnerId);
			//redis publish
			await redisClient.lPush('game:results', JSON.stringify(stats));
			io.to(data.gameId).emit('game:ended', action_result.winner);
			setTimeout(() => { games.delete(data.gameId); }, 5000);
		}
		else if (action_result.turnEnded) {
			const timers = { pendingAcks: new Set() };
			timers.revealTimer = setTimeout(() => {
				endTurn(gameStruct, data.gameId);
			}, 7000);
			gameTimers.set(data.gameId, timers);
		}
	});

	socket.on('game:check', (data) => {
		const gameStruct = games.get(data.gameId);
		const timers = gameTimers.get(data.gameId);
		if (!gameStruct || !timers || !timers.pendingAcks)
			return;
		timers.pendingAcks.add(socket.user.id);
		const connectedPlayers = gameStruct.players.filter(player => player.connected && !player.eliminated);
		if (timers.pendingAcks.size === connectedPlayers.length) {
			clearTimeout(timers.revealTimer);
			gameTimers.delete(data.gameId);
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
			const timers = gameTimers.get(gameId);
			if (timers && timers.revealTimer) {
				clearTimeout(timers.revealTimer);
				gameTimers.delete(gameId);
			}
			setPlayerTimer(player.id, 'turnTimer', setTimeout(() => {
				gameStruct.cardsRevealed = [];
				gameStruct.currentAction = ACTIONS_NUMBER.FIRST;
				nextPlayer(gameStruct);
				io.to(gameId).emit('game:update', { action_result: null, gameStruct });
			}, 15000));
		}
		player.connected = false;
		io.to(gameId).emit('game:playerDisconnected', { userId: socket.user.id });
		setPlayerTimer(player.id, 'disconnectTimer', setTimeout(() => {
			player.eliminated = true;
			gameBySocket.delete(socket.id);
			io.to(gameId).emit('game:playerEliminated', { userId: socket.user.id });
			const activePlayers = gameStruct.players.filter(player => player.connected && !player.eliminated);
			if (activePlayers.length <= 1) {
				if (activePlayers.length === 1) {
					io.to(gameId).emit('game:ended', { winnerId: activePlayers[0].id, reason: 'FORFEIT' });
					setTimeout(() => {
						games.delete(gameId);
						gameTimers.delete(gameId);
						playersTimers.delete(player.id);
					}, 5000);
				}
				else {
					games.delete(gameId);
					gameTimers.delete(gameId);
					playersTimers.delete(player.id);
				}
			}
		}, 30000));
		console.log(`Client disconnected (user: ${socket.user.username}): ${socket.id}`);
	})
});