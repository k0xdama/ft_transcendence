import { db } from '../config/db.js';
import { redisClient } from '../config/redis.js';
import { checkLobbyMembership } from './lobby-client.js';
import {
	MissingFieldError,
	InvalidFieldError,
	CannotBlockSelfError,
	NotLobbyMemberError,
	LobbyServiceUnavailableError } from '../utils/errors.js';

const VALID_MESSAGE_TYPES = ['user_text', 'quick_chat'];

class ChatService {
	async blockUser(blockerId, blockedId) {
		if (!blockedId)
			throw new MissingFieldError('Blocked user ID');

		if (blockerId === blockedId)
			throw new CannotBlockSelfError();

		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[blockerId, blockedId]
		);

		await redisClient.sAdd(`chat:blocked:${blockerId}`, blockedId);
	}

	async unblockUser(blockerId, blockedId) {
		await db.none(
			`DELETE FROM chat.blocked_users
			WHERE blocker_id = $1 AND blocked_id = $2`,
			[blockerId, blockedId]
		);

		await redisClient.sRem(`chat:blocked:${blockerId}`, blockedId);
	}

	async sendLobbyMessage({ lobbyId, userId, username, content, messageType = 'user_text', accessToken }) {
		if (!lobbyId)
			throw new MissingFieldError('Lobby ID');

		if (!content || content.trim().length === 0)
			throw new MissingFieldError('Message content');

		if (!VALID_MESSAGE_TYPES.includes(messageType))
			throw new InvalidFieldError('Message type must be user_text or quick_chat');

		let isMember;

		try {
			isMember = await checkLobbyMembership(lobbyId, userId, accessToken);
		}
		catch (error) {
			throw new LobbyServiceUnavailableError();
		}
		if (!isMember)
			throw new NotLobbyMemberError();

		const message = await db.one(
			`INSERT INTO chat.lobby_messages (lobby_id, sender_id, content, message_type)
			VALUES ($1, $2, $3, $4)
			RETURNING id, lobby_id, sender_id, content, message_type, created_at`,
			[lobbyId, userId, content.trim(), messageType]
		);

		const payload = {
			...message,		// spread operator: copies all message properties into this object
			username
		};

		await redisClient.publish('chat:messages', JSON.stringify(payload));	// for WebSocket broadcast

		return payload;
	}
}

export const chatService = new ChatService();