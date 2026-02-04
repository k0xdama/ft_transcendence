import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app, { response } from '../server.js'

describe('Backend /api/health', () => {
	it('should return status OK', async () => {
		const response = await request(app).get('/api/health')

		expect(response.status).toBe(200)
		expect(response.body.status).toBe('OK')
		expect(response.body.message).toBe('Backend is running')
		expect(response.body.timestamp).toBeDefined()
	})
})