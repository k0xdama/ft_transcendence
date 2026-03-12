import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import { createGame, executeAction } from './game-logic.js';
import { startGame } from './game-logic.js';
import { addPlayer } from './game-logic.js';
import { SocketAddress } from 'net';

const io = new Server(3001, {
	cors: {
		origin: '*',
		action: ['GET', 'POST']
	}
});

console.log('GAME-SERVICE started on port 3001');

const games = new Map();

io.on('connection', (socket) => {
	console.log(`Client connected: ${socket.id}`);

	socket.on('game:create', (data) => {
		const gameId = crypto.randomUUID();
		const gameStruct = createGame(gameId, data.gameMode);
		gameStruct.creatorId = socket.id;
		games.set(gameId, gameStruct);
		socket.join(gameId);
		addPlayer(gameStruct, socket.id);
		console.log(`Game created: ${gameId}`);
		console.log(`Player ${socket.id} joined the game ${gameId}`);
		socket.emit('game:created', { gameId });
	});

	socket.on('game:join', (data) => {
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `Aucune partie avec cet identifiant n'existe`);
			return;
		}
		for (const player of gameStruct.players) {
			if (socket.id === player.id) {
				socket.emit('error', 'Vous avez déjà rejoint cette partie');
				return ;
			}
		}
		socket.join(data.gameId);
		addPlayer(gameStruct, socket.id);
		socket.emit('game:joined', { gameId: data.gameId });
		console.log(`Player ${socket.id} joined the game ${data.gameId}`);
	});

	socket.on('game:start', (data) => {
		console.log('game:start reçu', data);
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `La partie n'existe plus...Quelque chose a tourné au vinaigre...`);
			return;
		}
    	console.log('playersNumber :', gameStruct?.playersNumber);
		if (socket.id !== gameStruct.creatorId) {
			socket.emit('error', `Seul l'hôte peut lancer la partie`);
			return;
		}
		else if (gameStruct.playersNumber < 3) {
			socket.emit('error', 'Pas assez de joueurs pour lancer la partie (3 minimum)');
			return;
		}
		startGame(gameStruct);
		io.to(data.gameId).emit('game:started', { gameStruct });
		console.log(`Game ${data.gameId} has been started !`);
	});

	socket.on('game:action', (data) => {
		console.log('game:action reçu', data);
		const gameStruct = games.get(data.gameId);
		if (!gameStruct) {
			socket.emit('error', `La partie n'existe plus...Quelque chose a tourné au vinaigre...`);
			return;
		}
		if (socket.id !== gameStruct.currentPlayer) {
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