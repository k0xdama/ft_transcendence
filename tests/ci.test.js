import { describe, it, expect } from 'vitest';

describe('Frontend ↔ Backend integration', () => {
	it('frontend can reach backend health endpoint', async () => {
		const response = await fetch('http://localhost:5173/api/health')
		expect(response.ok).toBe(true)

		const data = await response.json()
		expect(data.status).toBe('OK')
		expect(data.message).toBe('Backend is running')
		expect(data.timestamp).toBeDefined()
	});
});