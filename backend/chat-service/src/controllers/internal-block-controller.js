import { chatService } from '../class/chat-service-class.js';

// POST /internal/block — called by player-service
export async function internalBlockUser(req, res) {
	try {
		const { blockerId, blockedId } = req.body;

		if (!blockerId || !blockedId)
			return res.status(400).json({ error: 'Missing blockerId or blockedId' });

		await chatService.blockUser(blockerId, blockedId);

		return res.status(200).json({ message: 'User blocked in chat' });
	}
	catch (error) {
		if (error.isOperational)
			return res.status(error.statusCode).json({ error: error.reason });

		console.error('Internal block user:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// DELETE /internal/unblock — called by player-service
export async function internalUnblockUser(req, res) {
	try {
		const { blockerId, blockedId } = req.body;

		if (!blockerId || !blockedId)
			return res.status(400).json({ error: 'Missing blockerId or blockedId' });

		await chatService.unblockUser(blockerId, blockedId);

		return res.status(200).json({ message: 'User unblocked in chat' });
	}
	catch (error) {
		console.error('Internal unblock user:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
