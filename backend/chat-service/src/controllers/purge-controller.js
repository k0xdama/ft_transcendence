import { chatService } from '../class/chat-service-class.js';

// DELETE /chat/users/:userId — called internally by player-service on account deletion
export async function purgeUserData(req, res) {
	try {
		const userId = req.params.userId;

		await chatService.purgeUserData(userId);

		return res.status(204).send();
	}
	catch (error) {
		console.error('Purge user data:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
