import { db } from '../config/db.js';

class ChatService {
	async sendMessage({ lobbyId, userId, content, messageType }) {
		// const blockedBy = ;

		const message = await db.one(
			`INSERT INTO chat.lobby_messages (lobby_id, sender_id, content)
			VALUES ($1, $2, $3)
			RETURNING created_at`,
			[lobbyId, userId, content]
		);

		const date = new Date(message.created_at);

		// await pubsubService.publishMessage(lobbyId, message, { blockedBy });

		return message;
	}
}

export const chatService = new ChatService();