import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../chat-server.js';
import { db } from '../src/config/db.js';
import { redisClient } from '../src/config/redis.js';
import { userA, userB, userC, generateTestToken } from './helpers.js';

const tokenA = generateTestToken(userA);
const tokenB = generateTestToken(userB);
const tokenC = generateTestToken(userC);

const FAKE_UUID = '00000000-0000-0000-0000-000000000000';

let conversationId;

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
	const response = await request(app)
		.post('/chat/dm')
		.set('Authorization', `Bearer ${tokenA}`)
		.send({ targetId: userB.id });
	conversationId = response.body.id;
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

// ─── POST /chat/dm ────────────────────────────────────────────────────────────

describe('POST /chat/dm', () => {
	it('should create a new conversation', async () => {
		const response = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userC.id });
		expect(response.status).toBe(201);
		expect(response.body.id).toBeDefined();
		expect(response.body.user1_id).toBeDefined();
		expect(response.body.user2_id).toBeDefined();
	});

	it('should return existing conversation on duplicate (200)', async () => {
		const response = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userB.id });
		expect(response.status).toBe(200);
		expect(response.body.id).toBe(conversationId);
	});

	it('should reject DMing yourself', async () => {
		const response = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ targetId: userA.id });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('yourself');
	});

	it('should reject missing targetId', async () => {
		const response = await request(app)
			.post('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({});
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject request without token', async () => {
		const response = await request(app)
			.post('/chat/dm')
			.send({ targetId: userB.id });
		expect(response.status).toBe(401);
	});
});

// ─── POST /chat/dm/:conversationId/send ───────────────────────────────────────

describe('POST /chat/dm/:conversationId/send', () => {
	it('should send a message', async () => {
		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'Hello userB!' });
		expect(response.status).toBe(201);
		expect(response.body.id).toBeDefined();
		expect(response.body.conversation_id).toBe(conversationId);
		expect(response.body.sender_id).toBe(userA.id);
		expect(response.body.content).toBe('Hello userB!');
		expect(response.body.created_at).toBeDefined();
	});

	it('should allow the other member to send too', async () => {
		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ content: 'Hey userA!' });
		expect(response.status).toBe(201);
		expect(response.body.sender_id).toBe(userB.id);
	});

	it('should reject missing content', async () => {
		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({});
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject empty content', async () => {
		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: '   ' });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject if not a conversation member', async () => {
		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenC}`)
			.send({ content: 'Intruder!!!' });
		expect(response.status).toBe(403);
	});

	it('should reject if conversation does not exist', async () => {
		const response = await request(app)
			.post(`/chat/dm/${FAKE_UUID}/send`)
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'Ayooo' });
		expect(response.status).toBe(404);
	});

	it('should reject if sender is blocked by recipient', async () => {
		// userA blocks userB
		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[userA.id, userB.id]
		);

		const response = await request(app)
			.post(`/chat/dm/${conversationId}/send`)
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ content: 'Hello? Are you receiving my messages???' });
		expect(response.status).toBe(403);

		// Cleanup
		await db.none(
			`DELETE FROM chat.blocked_users
			WHERE blocker_id = $1 AND blocked_id = $2`,
			[userA.id, userB.id]
		);
	});
});

// ─── GET /chat/dm/:conversationId/history ─────────────────────────────────────

describe('GET /chat/dm/:conversationId/history', () => {
	it('should return message history', async () => {
		const response = await request(app)
			.get(`/chat/dm/${conversationId}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body.length).toBeGreaterThan(0);
		expect(response.body[0]).toHaveProperty('id');
		expect(response.body[0]).toHaveProperty('sender_id');
		expect(response.body[0]).toHaveProperty('content');
		expect(response.body[0]).toHaveProperty('created_at');
	});

	it('should respect the limit query param', async () => {
		const response = await request(app)
			.get(`/chat/dm/${conversationId}/history?limit=2`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(response.body.length).toBeLessThanOrEqual(2);
	});

	it('should reject invalid limit', async () => {
		const response = await request(app)
			.get(`/chat/dm/${conversationId}/history?limit=lol`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(400);
	});

	it('should reject if not a conversation member', async () => {
		const response = await request(app)
			.get(`/chat/dm/${conversationId}/history`)
			.set('Authorization', `Bearer ${tokenC}`);
		expect(response.status).toBe(403);
	});

	it('should reject if conversation does not exist', async () => {
		const response = await request(app)
			.get(`/chat/dm/${FAKE_UUID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(404);
	});
});

// ─── GET /chat/dm ─────────────────────────────────────────────────────────────

describe('GET /chat/dm', () => {
	it('should return list of conversations with last message', async () => {
		const response = await request(app)
			.get('/chat/dm')
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body.length).toBeGreaterThan(0);
		expect(response.body[0]).toHaveProperty('id');
		expect(response.body[0]).toHaveProperty('user1_id');
		expect(response.body[0]).toHaveProperty('user2_id');
		expect(response.body[0]).toHaveProperty('last_message');
		expect(response.body[0]).toHaveProperty('last_message_at');
	});
});
