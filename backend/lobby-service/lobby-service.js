
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import fs from 'fs';
import { joinQueue } from './src/matchmaking.js';
import { queueBySocket } from './src/matchmaking.js';
import { queues } from './src/matchmaking.js';

const LOBBY_TYPES = {
	PUBLIC: 'PUBLIC',
	PRIVATE: 'PRIVATE'
};

const LOBBY_STATE = {
	WAITING: 'WAITING',
	FULL: 'FULL',
	GAME_STARTED: 'GAME_STARTED'
};

export const GAME_MODES = {
	CLASSIC: 'CLASSIC',
	LINKED: 'LINKED'
};

export const GAME_TYPES = {
	SOLO: 'SOLO',
	TEAM_UP: 'TEAM_UP'
};

const lobbys = new Map();
const lobbyBySocket = new Map();

const app = express();
app.use(express.json());

const server = createServer(app);
const io = new Server(server);

const redisPassword = fs.readFileSync('/run/secrets/redis_passwd', 'utf8').trim();
const redisClient = createClient({
	socket: { host: 'redis', port: 6379 },
	password: redisPassword
});
redisClient.on('error', (err) => console.error('Redis Client:', err));
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

server.listen(3003, () => {
	console.log('LOBBY-SERVICE started on port 3003');
});

function createLobby(lobbyId, gameMode, gameType, creatorId, maxUsers) {
	const lobbyStruct = {
		lobbyId: lobbyId,
		lobbyType: LOBBY_TYPES.PRIVATE,
		creatorId: creatorId,
		createdAt: Date.now(),
		state: LOBBY_STATE.WAITING,
		gameId: null,
		users: [],
		rules: {
			gameMode: gameMode,
			gameType: gameType,
			maxUsers: maxUsers
		},
		teams: {}
	};

	return lobbyStruct;
}

function generateLobbyId(lobbysMap) {
	const set = 'ABCDEFHJKLMNOPQRSTUVWXZ23456789';
	let result = "";
	while (true) {
		for (let i = 0; i < 6; ++i) {
		const index_set = Math.floor(Math.random() * set.length);
		result += set[index_set];
		}
		if (lobbysMap.has(result) == false)
			break;
		else
			result = "";
	}
	return result;
}

function addUser(lobbyStruct, userId) {
	const user = {
		id: userId,
		ready: false
	};
	lobbyStruct.users.push(user);
}

function checkIfUsersReady(users) {
	for (const user of users) {
		if (user.ready === false)
			return false;
	}
	return true;
}

function publishLobbyMembers(lobbyId, lobbyStruct) {
	const members = lobbyStruct.users.map(u => u.id);
	redisClient.publish('lobby:membersChanged', JSON.stringify({ lobbyId, members }))
		.catch(err => console.error('Redis publish lobby:membersChanged:', err));
}

function publishUserStatus(userId, status) {
	if (status === 'online')
		redisClient.sAdd('users:online', userId).catch(console.error);
	else
		redisClient.sRem('users:online', userId).catch(console.error);
	redisClient.publish('user:statusChanged', JSON.stringify({ userId, status }))
		.catch(err => console.error('Redis publish user:statusChanged:', err));
}

io.on('connection', (socket) => {
	console.log(`Client connected: ${socket.id}`);

	socket.on('lobby:create', (data) => {
		const lobbyId = generateLobbyId(lobbys);
		const lobbyStruct = createLobby(lobbyId, data.gameMode, data.gameType, socket.user.id, data.maxUsers);
		lobbys.set(lobbyId, lobbyStruct);
		socket.join(lobbyId);
		addUser(lobbyStruct, socket.user.id);
		console.log(`Lobby created: ${lobbyId}`);
		console.log(`Client ${socket.id} (user: ${socket.user.username}) joined the lobby ${lobbyId}`);
		lobbyBySocket.set(socket.id, lobbyId);
		publishLobbyMembers(lobbyId, lobbyStruct);
		socket.emit('lobby:created', { lobbyId });
		socket.emit('lobby:joined', { lobbyStruct });
	});

	socket.on('matchmaking:join', async (data) => {
		const matchedPlayers = joinQueue(socket, data);
		if (matchedPlayers === null)
				return;
		const lobbyId = generateLobbyId(lobbys);
		const lobbyStruct = createLobby(lobbyId, data.gameMode, data.gameType, 
										matchedPlayers[0].userId, data.maxUsers);
		lobbyStruct.lobbyType = LOBBY_TYPES.PUBLIC;
		lobbys.set(lobbyId, lobbyStruct);
		for (const player of matchedPlayers) {
			addUser(lobbyStruct, player.userId);
			player.socket.join(lobbyId);
			lobbyBySocket.set(player.socket.id, lobbyId);
		}
		try {
			//variable d'environnement docker compose ?
			const response = await fetch("http://game:3002/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameMode: lobbyStruct.rules.gameMode,
					gameType: lobbyStruct.rules.gameType,
					creatorId: lobbyStruct.creatorId,
					users: lobbyStruct.users.map(user => user.id)
				})
			});
			const gameData = await response.json();
			lobbyStruct.gameId = gameData.gameId;
			lobbyStruct.state = LOBBY_STATE.GAME_STARTED;
			redisClient.publish('lobby:gameStarting', JSON.stringify({ lobbyId, gameId: gameData.gameId }))
				.catch(console.error);
			io.to(lobbyId).emit('lobby:gameStarting', { gameId: gameData.gameId });
		}
		catch {
			for (const player of matchedPlayers)
				player.socket.emit('error', 'Unable to start the game, the game server is unreachable');
		}

	});

	socket.on('lobby:join', (data) => {
		const lobbyStruct = lobbys.get(data.lobbyId);
		if (!lobbyStruct) {
			socket.emit('error', `No lobby with this ID exists`);
			return;
		}
		for (const user of lobbyStruct.users) {
			if (socket.user.id === user.id) {
				socket.emit('error', 'You have already joined this lobby');
				return;
			}
		}
		if (lobbyStruct.state === LOBBY_STATE.FULL) {
			socket.emit('error', 'This lobby is already full');
			return;
		}
		else if (lobbyStruct.state === LOBBY_STATE.GAME_STARTED) {
			socket.emit('error', 'You cannot join this lobby, the game has already started');
			return;
		}
		socket.join(data.lobbyId);
		addUser(lobbyStruct, socket.user.id);
		console.log(`${socket.user.username} (client: ${socket.id}) joined the lobby ${data.lobbyId}`);
		lobbyBySocket.set(socket.id, data.lobbyId);
		if (lobbyStruct.users.length === lobbyStruct.rules.maxUsers)
			lobbyStruct.state = LOBBY_STATE.FULL;
		publishLobbyMembers(data.lobbyId, lobbyStruct);
		io.to(data.lobbyId).emit('lobby:joined', { lobbyStruct });
	});

	socket.on('lobby:ready', (data) => {
		const lobbyStruct = lobbys.get(data.lobbyId);
		if (!lobbyStruct) {
			socket.emit('error', `Something went wrong...`);
			return;
		}
		const user = lobbyStruct.users.find(user => user.id === socket.user.id);
		if (user === undefined) {
			socket.emit('error', `${socket.user.username} is not a member of the lobby ${data.lobbyId}`);
			return;
		}
		user.ready = !user.ready;
		io.to(data.lobbyId).emit('lobby:readyChanged', { lobbyStruct });
	});

	socket.on('lobby:start', async (data) => {
		const lobbyStruct = lobbys.get(data.lobbyId);
		if (!lobbyStruct) {
			socket.emit('error', `Something went wrong...`);
			return;
		}
		if (socket.user.id !== lobbyStruct.creatorId) {
			socket.emit('error', `Only the lobby host can start the game`);
			return;
		}
		else if (lobbyStruct.users.length !== lobbyStruct.rules.maxUsers) {
			socket.emit('error', `The lobby is not full, given the number of players required by the game rules`);
			return;
		}
		else if (checkIfUsersReady(lobbyStruct.users) === false) {
			socket.emit('error', `Not all players in the lobby are ready, the game cannot start`);
			return;
		}
		try {
			//env var via docker compose ?
			const response = await fetch("http://game:3002/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameMode: lobbyStruct.rules.gameMode,
					gameType: lobbyStruct.rules.gameType,
					creatorId: lobbyStruct.creatorId,
					users: lobbyStruct.users.map(user => user.id)
				})
			});
			const gameData = await response.json();
			lobbyStruct.gameId = gameData.gameId;
			lobbyStruct.state = LOBBY_STATE.GAME_STARTED;
			redisClient.publish('lobby:gameStarting', JSON.stringify({ lobbyId: data.lobbyId, gameId: gameData.gameId }))
				.catch(console.error);
			io.to(data.lobbyId).emit('lobby:gameStarting', { gameId: gameData.gameId });
		}
		catch {
			socket.emit('error', 'Unable to start the game, the game server is unreachable');
		}
	});

	socket.on('matchmaking:leave', () => {
		const queueKey = queueBySocket.get(socket.id);
		if (queueKey === undefined)
			return;
		const users = queues.get(queueKey);
		const userIndex = users.findIndex(player => player.socket.id === socket.id);
		users.splice(userIndex, 1);
		queueBySocket.delete(socket.id);
	});

	socket.on('disconnect', () => {
		publishUserStatus(socket.user.id, 'offline');

		const lobbyId = lobbyBySocket.get(socket.id);
		if (lobbyId != undefined) {
			const lobbyStruct = lobbys.get(lobbyId);
			const userIndex = lobbyStruct.users.findIndex(user => user.id === socket.user.id);
			lobbyStruct.users.splice(userIndex, 1);
			if (lobbyStruct.users.length === 0) {
				lobbys.delete(lobbyId);
				lobbyBySocket.delete(socket.id);
				redisClient.publish('lobby:membersChanged', JSON.stringify({ lobbyId, members: [] }))
					.catch(console.error);
			}
			else {
				if (lobbyStruct.creatorId === socket.user.id)
					lobbyStruct.creatorId = lobbyStruct.users[0].id;
				if (lobbyStruct.state === LOBBY_STATE.FULL)
					lobbyStruct.state = LOBBY_STATE.WAITING;
				lobbyBySocket.delete(socket.id);
				publishLobbyMembers(lobbyId, lobbyStruct);
				io.to(lobbyId).emit('lobby:disconnected', { userId: socket.user.id });
				console.log(`Client disconnected (user: ${socket.user.username}): ${socket.id}`);
			}
		}
		else {
			const queueKey = queueBySocket.get(socket.id);
			if (queueKey === undefined) 
				return;
			const queue = queues.get(queueKey);
			const index = queue.findIndex(player => player.socket.id === socket.id);
       	 	queue.splice(index, 1);
       		queueBySocket.delete(socket.id);
		}
	});
});

