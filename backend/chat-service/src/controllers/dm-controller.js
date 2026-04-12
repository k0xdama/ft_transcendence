import { chatService } from '../class/chat-service-class.js';
import { logError } from '../utils/logger.js';

// POST /chat/dm
export async function createDM(req, res) {
	try {
		const { targetId } = req.body;
		const userId = req.user.id;

		const { conversation, created } = await chatService.createDM({ userId, targetId });

		return res.status(created ? 201 : 200).json(conversation);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		logError('create DM conversation', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// POST /chat/dm/:conversationId/send
export async function sendDM(req, res) {
	try {
		const conversationId = req.params.conversationId;
		const { content } = req.body;
		const senderId = req.user.id;

		const message = await chatService.sendDM({ conversationId, senderId, content });

		return res.status(201).json(message);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		logError('send DM', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /chat/dm/:conversationId/history
export async function getDMHistory(req, res) {
	try {
		const conversationId = req.params.conversationId;
		const userId = req.user.id;

		let limit;
		if (req.query.limit) {
			limit = parseInt(req.query.limit, 10);
			if (isNaN(limit) || limit < 1)
				return res.status(400).json({ error: 'limit must be a positive integer' });
		}

		const history = await chatService.getDMHistory({ conversationId, userId, limit });

		return res.status(200).json(history);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		logError('DM history', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// PATCH /chat/dm/:conversationId/read
export async function markAsRead(req, res) {
	try {
		const conversationId = req.params.conversationId;
		const userId = req.user.id;

		const { readCount } = await chatService.markDMsAsRead({ conversationId, userId });

		return res.status(200).json({ readCount });
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		logError('mark DMs as read', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /chat/dm
export async function getMyDMs(req, res) {
	try {
		const userId = req.user.id;

		const conversations = await chatService.getMyDMs(userId);

		return res.status(200).json(conversations);
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		logError('get my DMs', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}