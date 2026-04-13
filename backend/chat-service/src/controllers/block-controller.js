import { chatService } from '../class/chat-service-class.js';

// POST /chat/block
export async function blockUser(req, res) {
	try {
		const { blockedId } = req.body;
		const blockerId = req.user.id;

		await chatService.blockUser(blockerId, blockedId);

		return res.status(200).json({ message: 'User blocked successfully' });
	}
	catch (error) {
		if (error.isOperational)
			return res.status(error.statusCode).json({ error: error.reason });

		console.error('Block user:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// DELETE /chat/unblock/:userId
export async function unblockUser(req, res) {
	try {
		const blockerId = req.user.id;
		const blockedId = req.params.userId;

		await chatService.unblockUser(blockerId, blockedId);

		return res.status(200).json({ message: 'User unblocked successfully' });
	}
	catch (error) {
		if (error.isOperational)
			return res.status(error.statusCode).json({ error: error.reason });

		console.error('Unblock user:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}