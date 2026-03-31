import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

// vi.mock is hoisted automatically — must appear before the imports it affects
vi.mock('../src/services/lobby-client.js', () => ({
	checkLobbyMembership: vi.fn().mockResolvedValue(true)
}));

import request from 'supertest';
import app from '../chat-server.js';
import { db } from '../src/config/db.js';
import { redisClient } from '../src/config/redis.js';
import { userA, userB, userC, generateTestToken } from './helpers.js';

const tokenA = generateTestToken(userA);
const tokenB = generateTestToken(userB);
const tokenC = generateTestToken(userC);

const TEST_ROOM_ID = 'TEST01';

// ─── Teardown ────────────────────────────────────────────────────────────────

afterAll(async () => {
	await db.none(`DELETE FROM chat.lobby_messages WHERE room_id = $1`, [TEST_ROOM_ID]);
	await db.$pool.end();
	await redisClient.quit();
});

// ─── POST /chat/lobby/send ────────────────────────────────────────────────────

describe('POST /chat/lobby/send', () => {
	it('should send a lobby message', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ roomId: TEST_ROOM_ID, content: 'Hi guys!' });
		expect(response.status).toBe(201);
		expect(response.body.id).toBeDefined();
		expect(response.body.room_id).toBe(TEST_ROOM_ID);
		expect(response.body.sender_id).toBe(userA.id);
		expect(response.body.content).toBe('Hi guys!');
		expect(response.body.message_type).toBe('user_text');
		expect(response.body.created_at).toBeDefined();
	});

	it('should allow sending a suggestion type message', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ roomId: TEST_ROOM_ID, content: 'GG!', messageType: 'suggestion' });
		expect(response.status).toBe(201);
		expect(response.body.message_type).toBe('suggestion');
	});

	it('should reject missing roomId', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ content: 'No room?' });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject missing content', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ roomId: TEST_ROOM_ID });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject empty content', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ roomId: TEST_ROOM_ID, content: '   ' });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject invalid message type', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ roomId: TEST_ROOM_ID, content: 'FAAAAH', messageType: 'troll' });
		expect(response.status).toBe(400);
	});

	it('should reject request without token', async () => {
		const response = await request(app)
			.post('/chat/lobby/send')
			.send({ roomId: TEST_ROOM_ID, content: 'Hello' });
		expect(response.status).toBe(401);
	});

	it('should return 403 when user is not a lobby member', async () => {
		const { checkLobbyMembership } = await import('../src/services/lobby-client.js');
		checkLobbyMembership.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenC}`)
			.send({ roomId: TEST_ROOM_ID, content: 'Am I in?' });
		expect(response.status).toBe(403);
	});

	it('should return 503 when lobby service is unavailable', async () => {
		const { checkLobbyMembership } = await import('../src/services/lobby-client.js');
		checkLobbyMembership.mockRejectedValueOnce(new Error('Connection refused'));

		const response = await request(app)
			.post('/chat/lobby/send')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ roomId: TEST_ROOM_ID, content: 'Hello???' });
		expect(response.status).toBe(503);
	});
});

// ─── GET /chat/lobby/:roomId/history ─────────────────────────────────────────

describe('GET /chat/lobby/:roomId/history', () => {
	it('should return message history', async () => {
		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
		expect(response.body.length).toBeGreaterThan(0);
		expect(response.body[0]).toHaveProperty('room_id');
		expect(response.body[0]).toHaveProperty('sender_id');
		expect(response.body[0]).toHaveProperty('content');
		expect(response.body[0]).toHaveProperty('created_at');
	});

	it('should respect the limit query param', async () => {
		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history?limit=1`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(response.body.length).toBeLessThanOrEqual(1);
	});

	it('should reject invalid limit', async () => {
		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history?limit=abc`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(400);
	});

	it('should reject request without token', async () => {
		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history`);
		expect(response.status).toBe(401);
	});

	it('should return 403 when user is not a lobby member', async () => {
		const { checkLobbyMembership } = await import('../src/services/lobby-client.js');
		checkLobbyMembership.mockResolvedValueOnce(false);

		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history`)
			.set('Authorization', `Bearer ${tokenC}`);
		expect(response.status).toBe(403);
	});

	it('should exclude messages from blocked users', async () => {
		// userA blocks userB
		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[userA.id, userB.id]
		);

		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		const senderIds = response.body.map(m => m.sender_id);
		expect(senderIds).not.toContain(userB.id);

		// Cleanup
		await db.none(
			`DELETE FROM chat.blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
			[userA.id, userB.id]
		);
	});

	it('should return 503 when lobby service is unavailable', async () => {
		const { checkLobbyMembership } = await import('../src/services/lobby-client.js');
		checkLobbyMembership.mockRejectedValueOnce(new Error('Connection refused'));

		const response = await request(app)
			.get(`/chat/lobby/${TEST_ROOM_ID}/history`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(503);
	});
});
