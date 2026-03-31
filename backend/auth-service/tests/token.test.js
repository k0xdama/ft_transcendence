import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../auth-server.js';
import { db } from '../src/config/db.js';

const testUser = {
	email: 'token@test.fr',
	username: 'tokenuser',
	password: 'Token1234!'
};

let refreshCookie;

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
	await request(app).post('/auth/register').send(testUser);

	const response = await request(app)
		.post('/auth/login')
		.send({ identifier: testUser.email, password: testUser.password });

	// set-cookie contains both refreshToken and access_token cookies
	refreshCookie = response.headers['set-cookie'];
});

afterAll(async () => {
	await db.none("DELETE FROM auth.users WHERE email LIKE '%@test.fr'");
	await db.$pool.end();
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe('POST /auth/refresh', () => {
	it('should return refreshed user and set new cookies', async () => {
		const response = await request(app)
			.post('/auth/refresh')
			.set('Cookie', refreshCookie);
		expect(response.status).toBe(200);
		expect(response.body.user).toBeDefined();
		// Both access_token and refreshToken cookies must be renewed
		expect(response.headers['set-cookie']).toBeDefined();

		// Update cookie for subsequent tests (token rotation)
		refreshCookie = response.headers['set-cookie'];
	});

	it('should reject an invalid refresh token', async () => {
		const response = await request(app)
			.post('/auth/refresh')
			.set('Cookie', 'refreshToken=invalidtoken');
		expect(response.status).toBe(401);
		expect(response.body.error).toBeDefined();
	});

	it('should reject a missing refresh token', async () => {
		const response = await request(app)
			.post('/auth/refresh');
		expect(response.status).toBe(401);
		expect(response.body.error).toBeDefined();
	});
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe('POST /auth/logout', () => {
	it('should logout successfully', async () => {
		const response = await request(app)
			.post('/auth/logout')
			.set('Cookie', refreshCookie);
		expect(response.status).toBe(200);
		expect(response.body.message).toBeDefined();
	});

	it('should handle logout without cookie gracefully', async () => {
		const response = await request(app)
			.post('/auth/logout');
		expect(response.status).toBe(200);
	});

	it('should invalidate the refresh token after logout', async () => {
		// Login again to get a fresh token
		const loginResponse = await request(app)
			.post('/auth/login')
			.send({ identifier: testUser.email, password: testUser.password });
		const cookie = loginResponse.headers['set-cookie'];

		// Logout
		await request(app).post('/auth/logout').set('Cookie', cookie);

		// Try to use the same token after logout
		const refreshResponse = await request(app)
			.post('/auth/refresh')
			.set('Cookie', cookie);
		expect(refreshResponse.status).toBe(401);
	});
});
