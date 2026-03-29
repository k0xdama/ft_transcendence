import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../auth-server.js';
import { db } from '../src/config/db.js';

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
	await request(app)
		.post('/auth/register')
		.send({
			email: 'marvin@test.fr',
			username: 'marvin42',
			password: 'b00t3ToR00t_'
		});
});

afterAll(async () => {
	await db.none("DELETE FROM auth.users WHERE email LIKE '%@test.fr'");
	await db.$pool.end();
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
	it('should login with email', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({
				identifier: 'marvin@test.fr',
				password: 'b00t3ToR00t_'
			});
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Login successful');
		expect(response.body.user).toBeDefined();
		expect(response.headers['set-cookie']).toBeDefined();
	});

	it('should login with username', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({
				identifier: 'marvin42',
				password: 'b00t3ToR00t_'
			});
		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Login successful');
		expect(response.body.user).toBeDefined();
	});

	it('should reject unknown user', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({
				identifier: 'unknown',
				password: 'd4tIsLife!'
			});
		expect(response.status).toBe(401);
		expect(response.body.error).toBe('Invalid credentials');
	});

	it('should reject wrong password', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({
				identifier: 'marvin42',
				password: '1dT2345@@'
			});
		expect(response.status).toBe(401);
		expect(response.body.error).toBe('Invalid credentials');
	});

	it('should reject missing identifier', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({ password: 'b00t3ToR00t_' });
		expect(response.status).toBe(401);
		expect(response.body.error).toBeDefined();
	});

	it('should reject missing password', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({ identifier: 'marvin42' });
		expect(response.status).toBe(401);
		expect(response.body.error).toBeDefined();
	});
});
