import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
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

// Internal REST endpoint used by chat-service to verify lobby membership
app.get('/rooms/:roomId/members/:userId', (req, res) => {
	const lobby = lobbys.get(req.params.roomId);
	if (!lobby)
		return res.status(404).json({ isMember: false });

	const isMember = lobby.users.some(u => u.id === req.params.userId);
	return res.status(200).json({ isMember });
});

const server = createServer(app);

export const io = new Server(server);

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
	console.log('LOBBY-SERVICE running on port 3003');
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

io.on('connection', (socket) => {
	console.log(`Client connected (${socket.user.username}): ${socket.id}`);

	socket.on('lobby:create', (data) => {
		const lobbyId = generateLobbyId(lobbys);
		const lobbyStruct = createLobby(lobbyId, data.gameMode, data.gameType, socket.user.id, data.maxUsers);
		lobbys.set(lobbyId, lobbyStruct);
		socket.join(lobbyId);
		addUser(lobbyStruct, socket.user.id);
		console.log(`Lobby created: ${lobbyId}`);
		console.log(`${socket.user.username} joined the lobby ${lobbyId} (client ${socket.id})`);
		lobbyBySocket.set(socket.id, lobbyId);
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
			//http://game:3002/create avec docker (env var later)
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
		io.to(data.lobbyId).emit('lobby:joined', { lobbyStruct });
	});

	socket.on('lobby:ready', (data) => {
		const lobbyStruct = lobbys.get(data.lobbyId);
		if (!lobbyStruct) {
			socket.emit('error', `Something went wrong...`);
			// ajouter console.log(error)
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
			// ajouter console.log(error)
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
			//http://game:3002/create avec docker (env var later)
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
		const lobbyId = lobbyBySocket.get(socket.id);
		if (lobbyId != undefined) {
			const lobbyStruct = lobbys.get(lobbyId);
			const userIndex = lobbyStruct.users.findIndex(user => user.id === socket.user.id);
			lobbyStruct.users.splice(userIndex, 1);
			if (lobbyStruct.users.length === 0) {
				lobbys.delete(lobbyId);
				lobbyBySocket.delete(socket.id);
			}
			else {
				if (lobbyStruct.creatorId === socket.user.id)
					lobbyStruct.creatorId = lobbyStruct.users[0].id;
				if (lobbyStruct.state === LOBBY_STATE.FULL)
					lobbyStruct.state = LOBBY_STATE.WAITING;
				lobbyBySocket.delete(socket.id);
				io.to(lobbyId).emit('lobby:disconnected', { userId: socket.user.id });
				console.log(`Client disconnected (user: ${socket.user.username}): ${socket.id}`);
			}
		}
		else {
			const queueKey = queueBySocket.get(socket.id);
			if (queueKey === undefined) 
				return;
			const queue = queues.get(queueKey);
			const index = queue.findIndex(p => p.socket.id === socket.id);
	   	 	queue.splice(index, 1);
	   		queueBySocket.delete(socket.id);
		}
	});
});

