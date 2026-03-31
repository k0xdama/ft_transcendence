import { db } from '../config/db.js';
import { redisClient } from '../config/redis.js';
import { checkLobbyMembership } from './lobby-client.js';
import {
	MissingFieldError,
	InvalidFieldError,
	CannotBlockSelfError,
	BlockedUserMessageError,
	NotLobbyMemberError,
	LobbyServiceUnavailableError,
	CannotDMSelfError,
	DMConversationNotFoundError,
	NotConversationMemberError } from '../utils/errors.js';

const VALID_MSG_TYPES = ['user_text', 'suggestion'];

class ChatService {
	// Private methods
	async #verifyLobbyMember(roomId, userId) {
		let isMember;
		try {
			isMember = await checkLobbyMembership(roomId, userId);
		}
		catch (error) {
			throw new LobbyServiceUnavailableError();
		}
		if (!isMember)
			throw new NotLobbyMemberError();
	}

	async #verifyDMConversationMember(conversationId, userId) {
		const conversation = await db.oneOrNone(
			`SELECT user1_id, user2_id
			FROM chat.direct_conversations
			WHERE id = $1`,
			[conversationId]
		);
		if (!conversation)
			throw new DMConversationNotFoundError();

		if (userId !== conversation.user1_id && userId !== conversation.user2_id)
			throw new NotConversationMemberError();

		return conversation;
	}

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

	async sendLobbyMessage({ roomId, userId, username, content, messageType = 'user_text' }) {
		if (!roomId)
			throw new MissingFieldError('Lobby room ID');

		if (!content || content.trim().length === 0)
			throw new MissingFieldError('Message content');

		if (!VALID_MSG_TYPES.includes(messageType))
			throw new InvalidFieldError('Message type must be user_text or suggestion');

		await this.#verifyLobbyMember(roomId, userId);

		const message = await db.one(
			`INSERT INTO chat.lobby_messages (room_id, sender_id, username, content, message_type)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, room_id, sender_id, username, content, message_type, created_at`,
			[roomId, userId, username, content.trim(), messageType]
		);

		// '...' is a spread operator: copies all message properties into this object
		const payload = { ...message, username };

		await redisClient.publish('chat:messages', JSON.stringify(payload));	// for WebSocket broadcast

		return payload;
	}

	async getLobbyHistory({ roomId, limit = 50, userId }) {
		if (!roomId)
			throw new MissingFieldError('Lobby room ID');

		await this.#verifyLobbyMember(roomId, userId);

		const blockedIds = await redisClient.sMembers(`chat:blocked:${userId}`);

		const history = await db.manyOrNone(
			`SELECT
				room_id,
				sender_id, username,
				content, message_type, created_at
			FROM chat.lobby_messages
			WHERE room_id = $1
			${blockedIds.length ? 'AND sender_id != ALL($3::uuid[])' : ''}
			ORDER BY created_at DESC
			LIMIT $2`,
			blockedIds.length ? [roomId, limit, blockedIds] : [roomId, limit]
		);

		return history;
	}

	async createDM({ userId, targetId }) {
		if (!targetId)
			throw new MissingFieldError('Target user ID');

		if (userId === targetId)
			throw new CannotDMSelfError();

		const [user1_id, user2_id] = userId < targetId ? [userId, targetId] : [targetId, userId];

		const existing = await db.oneOrNone(
			`SELECT id, user1_id, user2_id, created_at
			FROM chat.direct_conversations
			WHERE user1_id = $1 AND user2_id = $2`,
			[user1_id, user2_id]
		);
		if (existing)
			return { conversation: existing, created: false };

		const conversation = await db.one(
			`INSERT INTO chat.direct_conversations (user1_id, user2_id)
			VALUES ($1, $2)
			RETURNING id, user1_id, user2_id, created_at`,
			[user1_id, user2_id]
		);

		return { conversation, created: true };
	}

	async sendDM({ conversationId, senderId, content }) {
		if (!conversationId)
			throw new MissingFieldError('Conversation ID');

		if (!content || content.trim().length === 0)
			throw new MissingFieldError('Message content');

		const conversation = await this.#verifyDMConversationMember(conversationId, senderId);

		const otherId = senderId === conversation.user1_id
			? conversation.user2_id
			: conversation.user1_id;

		const blockedUser = await db.oneOrNone(
			`SELECT 1 FROM chat.blocked_users
			WHERE (blocker_id = $1 AND blocked_id = $2)
			OR (blocker_id = $2 AND blocked_id = $1)`,
			[senderId, otherId]
		);
		if (blockedUser)
			throw new BlockedUserMessageError();

		const message = await db.one(
			`INSERT INTO chat.direct_messages (conversation_id, sender_id, content)
			VALUES ($1, $2, $3)
			RETURNING id, conversation_id, sender_id, content, created_at`,
			[conversationId, senderId, content.trim()]
		);

		return message;
	}

	async getDMHistory({ conversationId, userId, limit = 50 }) {
		if (!conversationId)
			throw new MissingFieldError('Conversation ID');

		await this.#verifyDMConversationMember(conversationId, userId);

		const history = await db.manyOrNone(
			`SELECT id, sender_id, content, created_at
			FROM chat.direct_messages
			WHERE conversation_id = $1
			ORDER BY created_at DESC
			LIMIT $2`,
			[conversationId, limit]
		);

		return history;
	}

	// Note: Seuls les conversations contenant au moins un message ne s'affichent
	async getMyDMs(userId) {
		const conversations = await db.manyOrNone(
			`SELECT
				c.id,
				c.user1_id,
				c.user2_id,
				last_msg.content AS last_message,
				last_msg.sender_id AS last_sender_id,
				last_msg.created_at AS last_message_at
			FROM chat.direct_conversations c
			JOIN LATERAL (
				SELECT content, sender_id, created_at
				FROM chat.direct_messages
				WHERE conversation_id = c.id
				ORDER BY created_at DESC
				LIMIT 1
			) last_msg ON true
			WHERE c.user1_id = $1 OR c.user2_id = $1
			ORDER BY last_msg.created_at DESC`,
			[userId] // ON true: no additional conditions
		);

		return conversations;
	}
}

export const chatService = new ChatService();