import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../auth-service.js';
import { db } from '../src/config/db.js';

describe('Auth /auth/register', () => {
	it('should register a new user', async () => {
		const response = await request(app)
			.post('/auth/register')
			.send({
				email: 'miaou@test.fr',
				username: 'miaou',
				password: 'kiKoolol555$'
			});

		expect(response.status).toBe(201);
		expect(response.body.user).toBeDefined();
		expect(response.body.user.email).toBe('miaou@test.fr');
		expect(response.body.user.username).toBe('miaou');
	});

	it('should reject duplicate email', async () => {
		const response = await request(app)
			.post('/auth/register')
			.send({
				email: 'miaou@test.fr',
				username: 'elpatron',
				password: 'test2Test1test@'
			});

		expect(response.status).toBe(400);
		expect(response.body.error).toBeDefined();
	});

	it('should reject duplicate username', async () => {
		const response = await request(app)
			.post('/auth/register')
			.send({
				email: 'oggy@test.fr',
				username: 'miaou',
				password: 'tesT2test1test@'
			});

		expect(response.status).toBe(400);
		expect(response.body.error).toBeDefined();
	});
});

// Clean after performing tests
// afterAll(async () => {
// 	await db.none("DELETE FROM auth.users WHERE email LIKE '%@test.fr'");
// 	await db.$pool.end();
// });