import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../chat-service.js';
import { db } from '../src/config/db.js';
import { redisClient, lobbyMembers } from '../src/config/redis.js';
import { userA, userB, userC, generateTestToken } from './helpers.js';

const tokenA = generateTestToken(userA);
const tokenB = generateTestToken(userB);
const tokenC = generateTestToken(userC);

const TEST_LOBBY_ID = 'TEST01';

// ─── Setup / Teardown ─────────────────────────────────────────────────────

beforeAll(() => {
	lobbyMembers.set(TEST_LOBBY_ID, new Set([userA.id, userB.id]));
});

afterAll(async () => {
	await db.none(`DELETE FROM chat.ws_messages WHERE lobby_id = $1`, [TEST_LOBBY_ID]);
	await db.$pool.end();
	await redisClient.quit();
	lobbyMembers.delete(TEST_LOBBY_ID);
});

// ─── POST /chat/room/send ─────────────────────────────────────────────────

describe('POST /chat/room/send', () => {
	it('should send a WS message', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ lobbyId: TEST_LOBBY_ID, content: 'Hi guys!' });
		expect(res.status).toBe(201);
		expect(res.body.id).toBeDefined();
		expect(res.body.lobby_id).toBe(TEST_LOBBY_ID);
		expect(res.body.sender_id).toBe(userA.id);
		expect(res.body.content).toBe('Hi guys!');
		expect(res.body.message_type).toBe('user_text');
		expect(res.body.created_at).toBeDefined();
	});

	it('should allow sending a quick_reply type message', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ lobbyId: TEST_LOBBY_ID, content: 'GG!', messageType: 'quick_reply' });
		expect(res.status).toBe(201);
		expect(res.body.message_type).toBe('quick_reply');
	});

	it('should reject missing lobbyId', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'No room?' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject missing content', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ lobbyId: TEST_LOBBY_ID });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject empty content', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ lobbyId: TEST_LOBBY_ID, content: '   ' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject invalid message type', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ lobbyId: TEST_LOBBY_ID, content: 'FAAAAH', messageType: 'troll' });
		expect(res.status).toBe(400);
	});

	it('should reject request without token', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.send({ lobbyId: TEST_LOBBY_ID, content: 'Hello' });
		expect(res.status).toBe(401);
	});

	it('should return 403 when user is not a lobby member', async () => {
		const res = await request(app)
			.post('/chat/room/send')
			.set('Authorization', `Bearer ${tokenC}`)
			.send({ lobbyId: TEST_LOBBY_ID, content: 'Am I in?' });
		expect(res.status).toBe(403);
	});
});

// ─── GET /chat/room/:lobbyId/history ──────────────────────────────────────

describe('GET /chat/room/:lobbyId/history', () => {
	it('should return message history', async () => {
		const res = await request(app)
			.get(`/chat/room/${TEST_LOBBY_ID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty('lobby_id');
		expect(res.body[0]).toHaveProperty('sender_id');
		expect(res.body[0]).toHaveProperty('content');
		expect(res.body[0]).toHaveProperty('created_at');
	});

	it('should respect the limit query param', async () => {
		const res = await request(app)
			.get(`/chat/room/${TEST_LOBBY_ID}/history?limit=1`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(res.body.length).toBeLessThanOrEqual(1);
	});

	it('should reject invalid limit', async () => {
		const res = await request(app)
			.get(`/chat/room/${TEST_LOBBY_ID}/history?limit=abc`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(400);
	});

	it('should return 403 when user is not a lobby member', async () => {
		const res = await request(app)
			.get(`/chat/room/${TEST_LOBBY_ID}/history`)
			.set('Authorization', `Bearer ${tokenC}`);
		expect(res.status).toBe(403);
	});

	it('should exclude messages from blocked users', async () => {
		// userA blocks userB
		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[userA.id, userB.id]
		);

		const res = await request(app)
			.get(`/chat/room/${TEST_LOBBY_ID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		const senderIds = res.body.map(m => m.sender_id);
		expect(senderIds).not.toContain(userB.id);

		// Cleanup
		await db.none(
			`DELETE FROM chat.blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
			[userA.id, userB.id]
		);
	});
});
