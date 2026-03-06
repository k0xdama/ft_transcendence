import { chatService } from '../services/chat-service.js';

// POST /chat/dm
export async function createConversation(req, res) {
	try {
		const { targetId } = req.body;
		const userId = req.user.id;

		const conversation = await chatService.createConversation({
			userId,
			targetId
		});

		return res.status(201).json(conversation);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Create DM conversation:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}