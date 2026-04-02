import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../chat-service.js';
import { db } from '../src/config/db.js';
import { redisClient } from '../src/config/redis.js';
import { userA, userB, userC, generateTestToken } from './helpers.js';

const tokenA = generateTestToken(userA);
const tokenB = generateTestToken(userB);
const tokenC = generateTestToken(userC);

const FAKE_UUID = '00000000-0000-0000-0000-000000000000';

let conversationId;

// ─── Setup / Teardown ─────────────────────────────────────────────────────

beforeAll(async () => {
	const res = await request(app)
		.post('/chat/dm')
		.set('Authorization', `Bearer ${tokenA}`)
		.send({ targetId: userB.id });
	conversationId = res.body.id;
});

afterAll(async () => {
	await db.none(
		`DELETE FROM chat.direct_conversations
		WHERE (user1_id = $1 OR user2_id = $1)
		OR (user1_id = $2 OR user2_id = $2)`,
		[userA.id, userC.id]
	);
	await db.$pool.end();
	await redisClient.quit();
});

// ─── POST /chat/dm ────────────────────────────────────────────────────────

describe('POST /chat/dm', () => {
	it('should create a new conversation', async () => {
		const res = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userC.id });
		expect(res.status).toBe(201);
		expect(res.body.id).toBeDefined();
		expect(res.body.user1_id).toBeDefined();
		expect(res.body.user2_id).toBeDefined();
	});

	it('should return existing conversation on duplicate (200)', async () => {
		const res = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userB.id });
		expect(res.status).toBe(200);
		expect(res.body.id).toBe(conversationId);
	});

	it('should reject DMing yourself', async () => {
		const res = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userA.id });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('yourself');
	});

	it('should reject missing targetId', async () => {
		const res = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject request without token', async () => {
		const res = await request(app)
			.post('/chat/dm')
			.send({ targetId: userB.id });
		expect(res.status).toBe(401);
	});
});

// ─── POST /chat/dm/:conversationId/send ───────────────────────────────────

describe('POST /chat/dm/:conversationId/send', () => {
	it('should send a message', async () => {
		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'Hello userB!' });
		expect(res.status).toBe(201);
		expect(res.body.id).toBeDefined();
		expect(res.body.conversation_id).toBe(conversationId);
		expect(res.body.sender_id).toBe(userA.id);
		expect(res.body.content).toBe('Hello userB!');
		expect(res.body.created_at).toBeDefined();
	});

	it('should allow the other member to send too', async () => {
		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ content: 'Hey userA!' });
		expect(res.status).toBe(201);
		expect(res.body.sender_id).toBe(userB.id);
	});

	it('should reject missing content', async () => {
		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject empty content', async () => {
		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: '   ' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('required');
	});

	it('should reject if not a conversation member', async () => {
		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenC}`)
			.send({ content: 'Intruder!!!' });
		expect(res.status).toBe(403);
	});

	it('should reject if conversation does not exist', async () => {
		const res = await request(app)
			.post(`/chat/dm/${FAKE_UUID}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'Ayooo' });
		expect(res.status).toBe(404);
	});

	it('should reject if sender is blocked by recipient', async () => {
		// userA blocks userB
		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[userA.id, userB.id]
		);

		const res = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ content: 'Hello? Are you receiving my messages???' });
		expect(res.status).toBe(403);

		// Cleanup
		await db.none(
			`DELETE FROM chat.blocked_users
			WHERE blocker_id = $1 AND blocked_id = $2`,
			[userA.id, userB.id]
		);
	});
});

// ─── GET /chat/dm/:conversationId/history ─────────────────────────────────

describe('GET /chat/dm/:conversationId/history', () => {
	it('should return message history', async () => {
		const res = await request(app)
			.get(`/chat/dm/${conversationId}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty('id');
		expect(res.body[0]).toHaveProperty('sender_id');
		expect(res.body[0]).toHaveProperty('content');
		expect(res.body[0]).toHaveProperty('created_at');
	});

	it('should respect the limit query param', async () => {
		const res = await request(app)
			.get(`/chat/dm/${conversationId}/history?limit=2`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(res.body.length).toBeLessThanOrEqual(2);
	});

	it('should reject invalid limit', async () => {
		const res = await request(app)
			.get(`/chat/dm/${conversationId}/history?limit=lol`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(400);
	});

	it('should reject if not a conversation member', async () => {
		const res = await request(app)
			.get(`/chat/dm/${conversationId}/history`)
			.set('Authorization', `Bearer ${tokenC}`);
		expect(res.status).toBe(403);
	});

	it('should reject if conversation does not exist', async () => {
		const res = await request(app)
			.get(`/chat/dm/${FAKE_UUID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(404);
	});
});

// ─── GET /chat/dm ─────────────────────────────────────────────────────────

describe('GET /chat/dm', () => {
	it('should return list of conversations with last message', async () => {
		const res = await request(app)
			.get('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0]).toHaveProperty('id');
		expect(res.body[0]).toHaveProperty('user1_id');
		expect(res.body[0]).toHaveProperty('user2_id');
		expect(res.body[0]).toHaveProperty('last_message');
		expect(res.body[0]).toHaveProperty('last_message_at');
	});
});
