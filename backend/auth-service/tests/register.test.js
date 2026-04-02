import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../auth-service.js';
import { db } from '../src/config/db.js';

// ─── Teardown ─────────────────────────────────────────────────────────────

afterAll(async () => {
	await db.none("DELETE FROM auth.users WHERE email LIKE '%@test.fr'");
	await db.$pool.end();
});

// ─── POST /auth/register ──────────────────────────────────────────────────

describe('POST /auth/register', () => {
	it('should register a new user', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({
				email: 'miaou@test.fr',
				username: 'miaou',
				password: 'kiKoolol555$'
			});
		expect(res.status).toBe(201);
		expect(res.body.user).toBeDefined();
		expect(res.body.user.email).toBe('miaou@test.fr');
		expect(res.body.user.username).toBe('miaou');
	});

	it('should reject duplicate email', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({
				email: 'miaou@test.fr',
				username: 'elpatron',
				password: 'test2Test1test@'
			});
		expect(res.status).toBe(400);
		expect(res.body.error).toBeDefined();
	});

	it('should reject duplicate username', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({
				email: 'oggy@test.fr',
				username: 'miaou',
				password: 'blaB2bla1*b'
			});
		expect(res.status).toBe(400);
		expect(res.body.error).toBeDefined();
	});
});

// ─── POST /auth/register — field validation ───────────────────────────────

describe('POST /auth/register — field validation', () => {
	it('should reject missing email', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ username: 'hellboy42', password: 'Bruuuh3630!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('Email');
	});

	it('should reject missing username', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', password: 'Bruuuh3630!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('Username');
	});

	it('should reject missing password', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'hellboy42' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('Password');
	});

	it('should reject invalid email format', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'born-to-code', username: 'hellboy42', password: 'Bruuuh3630!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('email');
	});

	it('should reject username too short (< 3 chars)', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'ab', password: 'Bruuuh3630!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('between');
	});

	it('should reject username with invalid characters', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'not good!', password: 'Bruuuh3630!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('Username');
	});

	it('should reject password too short (< 8 chars)', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'hellboy42', password: 'Ab1!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('8');
	});

	it('should reject password missing uppercase', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'hellboy42', password: 'nouppercase1!' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('uppercase');
	});

	it('should reject password missing special character', async () => {
		const res = await request(app)
			.post('/auth/register')
			.send({ email: 'miaou@test.fr', username: 'hellboy42', password: 'NoSpecial123' });
		expect(res.status).toBe(400);
		expect(res.body.error).toContain('special');
	});
});
