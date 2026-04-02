import { chatService } from '../class/chat-service-class.js';

// POST /chat/room/send
export async function sendWsMessage(req, res) {
	try {
		const { lobbyId, content, messageType } = req.body;
		const userId = req.user.id;
		const username = req.user.username;

		const message = await chatService.sendWsMessage({
			lobbyId,
			userId, username,
			content, messageType
		});

		return res.status(201).json(message);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Send WS message:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /chat/room/:lobbyId/history
export async function getChatWsHistory(req, res) {
	try {
		const lobbyId = req.params.lobbyId;
		const userId = req.user.id;

		let limit;
		if (req.query.limit) {
			limit = parseInt(req.query.limit, 10);
			if (isNaN(limit) || limit < 1)
				return res.status(400).json({ error: 'limit must be a positive integer' });
		}

		const history = await chatService.getChatWsHistory({ lobbyId, limit, userId });

		return res.status(200).json(history);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Chat WS history:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}