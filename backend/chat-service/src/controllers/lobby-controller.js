import { chatService } from '../services/chat-service.js';

// POST /chat/lobby/send
export async function sendLobbyMessage(req, res) {
	try {
		const { roomId, content, messageType } = req.body;
		const userId = req.user.id;
		const username = req.user.username;

		const message = await chatService.sendLobbyMessage({
			roomId,
			userId, username,
			content, messageType
			// + accessToken: req.accessToken
		});

		return res.status(201).json(message);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Send lobby message:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /chat/lobby/:roomId/history
export async function getLobbyHistory(req, res) {
	try {
		const roomId = req.params.roomId;

		let limit;
		if (req.query.limit) {
			limit = parseInt(req.query.limit, 10);
			if (isNaN(limit) || limit < 1)
				return res.status(400).json({ error: 'limit must be a positive integer' });
		}

		const history = await chatService.getLobbyHistory({ roomId, limit });
		// + accessToken: req.accessToken

		return res.status(200).json(history);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Lobby room history:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}