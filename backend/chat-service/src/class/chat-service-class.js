import { db } from '../config/db.js';
import { logError } from '../utils/logger.js';
import { redisClient, lobbyMembers } from '../config/redis.js';
import {
	MissingFieldError,
	InvalidFieldError,
	CannotBlockSelfError,
	BlockedUserMessageError,
	NotLobbyMemberError,
	CannotDMSelfError,
	DMConversationNotFoundError,
	NotConversationMemberError } from '../utils/errors.js';

// Bypass auto sign certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PLAYER_URL = process.env.PLAYER_URL || 'https://player:3001';

const VALID_MSG_TYPES = ['user_text', 'quick_reply', 'game_invite'];

class ChatService {
	// Private methods
	#verifyLobbyMember(lobbyId, userId) {
		const members = lobbyMembers.get(lobbyId);
		if (!members || !members.has(userId))
			throw new NotLobbyMemberError();
	}

	async verifyDMConversationMember(conversationId, userId) {
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

	async sendWsMessage({ lobbyId, userId, username, content, messageType = 'user_text' }) {
		if (!lobbyId)
			throw new MissingFieldError('Lobby room ID');

		if (!content || content.trim().length === 0)
			throw new MissingFieldError('Message content');

		if (!VALID_MSG_TYPES.includes(messageType))
			throw new InvalidFieldError('Message type must be user_text, quick_reply or game_invite');

		this.#verifyLobbyMember(lobbyId, userId);

		const message = await db.one(
			`INSERT INTO chat.ws_messages (lobby_id, sender_id, username, content, message_type)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, lobby_id, sender_id, username, content, message_type, created_at`,
			[lobbyId, userId, username, content.trim(), messageType]
		);

		// '...' is a spread operator: copies all message properties into this object
		const payload = { ...message, username };

		await redisClient.publish('chat:messages', JSON.stringify(payload));

		return payload;
	}

	async getChatWsHistory({ lobbyId, limit = 50, userId }) {
		if (!lobbyId)
			throw new MissingFieldError('Lobby room ID');

		this.#verifyLobbyMember(lobbyId, userId);

		const blockedIds = await redisClient.sMembers(`chat:blocked:${userId}`);

		const history = await db.manyOrNone(
			`SELECT
				lobby_id,
				sender_id, username,
				content, message_type, created_at
			FROM chat.ws_messages
			WHERE lobby_id = $1
			${blockedIds.length
				? 'AND sender_id != ALL($3::uuid[])'
				: ''}
			ORDER BY created_at DESC
			LIMIT $2`,
			blockedIds.length
				? [lobbyId, limit, blockedIds]
				: [lobbyId, limit]
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

		const conversation = await this.verifyDMConversationMember(conversationId, senderId);

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

		// Fetch sender username via player-service for real-time payload
		let senderUsername = 'Unknown';
		try {
			const res = await fetch(`${PLAYER_URL}/internal/users/batch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userIds: [senderId] })
			});
			if (res.ok) {
				const map = await res.json();
				senderUsername = map[senderId]?.username || 'Unknown';
			}
		} catch (err) {
			logError('fetch sender username', err.message);
		}

		const payload = {
			...message,
			username: senderUsername,
			recipientId: otherId
		};

		await redisClient.publish('dm:newMessage', JSON.stringify(payload));

		return message;
	}

	async markDMsAsRead({ conversationId, userId }) {
		if (!conversationId)
			throw new MissingFieldError('Conversation ID');

		const conversation = await this.verifyDMConversationMember(conversationId, userId);

		const result = await db.result(
			`UPDATE chat.direct_messages
			SET read_at = NOW()
			WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
			[conversationId, userId]
		);

		const otherId = userId === conversation.user1_id
			? conversation.user2_id
			: conversation.user1_id;

		return { readCount: result.rowCount, otherId };
	}

	async getDMHistory({ conversationId, userId, limit = 50 }) {
		if (!conversationId)
			throw new MissingFieldError('Conversation ID');

		await this.verifyDMConversationMember(conversationId, userId);

		const history = await db.manyOrNone(
			`SELECT id, sender_id, content, created_at, read_at
			FROM chat.direct_messages
			WHERE conversation_id = $1
			ORDER BY created_at DESC
			LIMIT $2`,
			[conversationId, limit]
		);

		return history;
	}

	async purgeUserData(userId) {
		await db.tx(async t => {
			await t.none(
				`DELETE FROM chat.direct_messages
				WHERE conversation_id IN (
					SELECT id FROM chat.direct_conversations
					WHERE user1_id = $1 OR user2_id = $1
				)`,
				[userId]
			);
			await t.none(
				`DELETE FROM chat.direct_conversations
				WHERE user1_id = $1 OR user2_id = $1`,
				[userId]
			);
			await t.none(
				`DELETE FROM chat.ws_messages WHERE sender_id = $1`,
				[userId]
			);
			await t.none(
				`DELETE FROM chat.blocked_users
				WHERE blocker_id = $1 OR blocked_id = $1`,
				[userId]
			);
		});

		await redisClient.del(`chat:blocked:${userId}`);
	}

	async purgeExpiredMessages() {
		const ws = await db.result(
			`DELETE FROM chat.ws_messages WHERE expires_at < NOW()`
		);
		const dm = await db.result(
			`DELETE FROM chat.direct_messages WHERE expires_at < NOW()`
		);
		return { wsDeleted: ws.rowCount, dmDeleted: dm.rowCount };
	}

	async getMyDMs(userId) {
		const conversations = await db.manyOrNone(
			`SELECT
				c.id,
				c.user1_id,
				c.user2_id,
				last_msg.content AS last_message,
				last_msg.sender_id AS last_sender_id,
				last_msg.created_at AS last_message_at,
				(SELECT COUNT(*) FROM chat.direct_messages
				 WHERE conversation_id = c.id AND sender_id != $1 AND read_at IS NULL
				) AS unread_count
			FROM chat.direct_conversations c
			LEFT JOIN LATERAL (
				SELECT content, sender_id, created_at
				FROM chat.direct_messages
				WHERE conversation_id = c.id
				ORDER BY created_at DESC
				LIMIT 1
			) last_msg ON true
			WHERE c.user1_id = $1 OR c.user2_id = $1
			ORDER BY last_msg.created_at DESC NULLS LAST`,
			[userId]
		);

		if (conversations.length === 0)
			return conversations;

		// Resolve other-user usernames via player-service internal API
		const otherIds = conversations.map(c =>
			c.user1_id === userId ? c.user2_id : c.user1_id
		);
		const uniqueIds = [...new Set(otherIds)];

		let userMap = {};
		try {
			const res = await fetch(`${PLAYER_URL}/internal/users/batch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userIds: uniqueIds })
			});
			if (res.ok)
				userMap = await res.json();
		} catch (err) {
			logError('fetch usernames from player-service', err.message);
		}

		return conversations.map(c => {
			const otherId = c.user1_id === userId ? c.user2_id : c.user1_id;
			const player = userMap[otherId] || {};
			return {
				...c,
				other_username: player.username || 'Unknown',
				other_avatar: player.pp_path || null
			};
		});
	}
}

export const chatService = new ChatService();