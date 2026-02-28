import { chatService } from '../services/chat-service.js';

// POST /chat/lobby/send
export async function sendLobbyMessage(req, res) {
	try {
		const { lobbyId, content, messageType } = req.body;
		const userId = req.user.id;
		const username = req.user.username;

		const message = await chatService.sendLobbyMessage({
			lobbyId,
			userId,
			username,
			content,
			messageType,
			accessToken: req.accessToken
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