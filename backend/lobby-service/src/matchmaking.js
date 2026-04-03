import { GAME_MODES, GAME_TYPES } from '../lobby-service.js';
//la map se compose comme suit : key [MODE-TYPE-NOMBREDEJOUEURS] -> value [object: socket.user.id & socket]
//exemple : CLASSIC/LINKED-SOLO/TEAM_UP-3/4/5/6

export const queues = new Map();
export const queueBySocket = new Map();

function generateCompositeKey(data) {
	const mode = data.gameMode;
	const type = data.gameType;
	const number = data.maxUsers;
	const key = mode + "-" + type + "-" + number;
	return (key);
}

export function joinQueue(socket, data) {
	const queueKey = generateCompositeKey(data);
	if (!queues.has(queueKey))
		queues.set(queueKey, []);
	const queue = queues.get(queueKey);
	const user = {
		userId: socket.user.id,
		socket : socket
	}
	queue.push(user);
	queueBySocket.set(socket.id, queueKey);
	if (queue.length === data.maxUsers) {
		const matchedPlayers = queue.splice(0);
		for (const user of matchedPlayers)
   			queueBySocket.delete(user.socket.id);
		return matchedPlayers;
	}
	return null;
}