import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../chat-server.js';
import { db } from '../src/config/db.js';
import { redisClient } from '../src/config/redis.js';
import { userA, userB, generateTestToken } from './helpers.js';

const tokenA = generateTestToken(userA);

// ─── Teardown ────────────────────────────────────────────────────────────────

afterAll(async () => {
	await db.none(
		'DELETE FROM chat.blocked_users WHERE blocker_id = $1',
		[userA.id]
	);
	await redisClient.del(`chat:blocked:${userA.id}`);
	await db.$pool.end();
	await redisClient.quit();
});

// ─── POST /chat/block ─────────────────────────────────────────────────────────

describe('POST /chat/block', () => {
	it('should block a user', async () => {
		const response = await request(app)
			.post('/chat/block')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ blockedId: userB.id });
		expect(response.status).toBe(200);
		expect(response.body.message).toBeDefined();

		// Check in DB
		const row = await db.oneOrNone(
			'SELECT * FROM chat.blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
			[userA.id, userB.id]
		);
		expect(row).not.toBeNull();

		// Check in Redis
		const isCached = await redisClient.sIsMember(
			`chat:blocked:${userA.id}`,
			userB.id
		);
		expect(isCached).toBeTruthy();
	});

	it('should ignore duplicate block (ON CONFLICT DO NOTHING)', async () => {
		const response = await request(app)
			.post('/chat/block')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ blockedId: userB.id });
		expect(response.status).toBe(200);
	});

	it('should reject blocking yourself', async () => {
		const response = await request(app)
			.post('/chat/block')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({ blockedId: userA.id });
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('yourself');
	});

	it('should reject missing blockedId', async () => {
		const response = await request(app)
			.post('/chat/block')
			.set('Authorization', `Bearer ${tokenA}`)
			.send({});
		expect(response.status).toBe(400);
		expect(response.body.error).toContain('required');
	});

	it('should reject request without token', async () => {
		const response = await request(app)
			.post('/chat/block')
			.send({ blockedId: userB.id });
		expect(response.status).toBe(401);
	});
});

// ─── DELETE /chat/unblock/:userId ─────────────────────────────────────────────

describe('DELETE /chat/unblock/:userId', () => {
	it('should unblock a user', async () => {
		const response = await request(app)
			.delete(`/chat/unblock/${userB.id}`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
		expect(response.body.message).toBeDefined();

		// Check in DB
		const row = await db.oneOrNone(
			'SELECT * FROM chat.blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
			[userA.id, userB.id]
		);
		expect(row).toBeNull();

		// Check in Redis
		const isCached = await redisClient.sIsMember(
			`chat:blocked:${userA.id}`,
			userB.id
		);
		expect(isCached).toBeFalsy();
	});

	it('should handle unblocking a non-blocked user gracefully', async () => {
		const response = await request(app)
			.delete(`/chat/unblock/${userB.id}`)
			.set('Authorization', `Bearer ${tokenA}`);
		expect(response.status).toBe(200);
	});
});
