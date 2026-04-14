import { describe, it, expect, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import fs from 'fs'

vi.mock('fs', async () => {
	const actual = await vi.importActual('fs')
	return { default: actual }
})

const { authGuard } = await import('../src/middleware/authGuard.js')

const JWT_SIGNING_KEY = fs.readFileSync('/run/secrets/jwt_signing_key', 'utf8').trim()

function buildResponse() {
	const res = {}
	res.status = vi.fn().mockReturnValue(res)
	res.json = vi.fn().mockReturnValue(res)
	return res
}

describe('authGuard middleware', () => {

	describe('when no token is provided', () => {
		it('should return 401', () => {
			const req = { cookies: {} }
			const res = buildResponse()
			const next = vi.fn()

			authGuard(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})
	})

	describe('when token is invalid', () => {
		it('should return 401', () => {
			const req = { cookies: { accessToken: 'not.a.valid.token' } }
			const res = buildResponse()
			const next = vi.fn()

			authGuard(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})
	})

	describe('when token is expired', () => {
		it('should return 401', () => {
			const expiredToken = jwt.sign({ userId: 1 }, JWT_SIGNING_KEY, { expiresIn: -1 })
			const req = { cookies: { accessToken: expiredToken } }
			const res = buildResponse()
			const next = vi.fn()

			authGuard(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})
	})

	describe('when token is valid', () => {
		it('should call next() and attach payload to req.user', () => {
			const validToken = jwt.sign({ userId: 1 }, JWT_SIGNING_KEY, { expiresIn: '1h' })
			const req = { cookies: { accessToken: validToken } }
			const res = buildResponse()
			const next = vi.fn()

			authGuard(req, res, next)

			expect(next).toHaveBeenCalledOnce()
			expect(req.user).toBeDefined()
			expect(req.user.userId).toBe(1)
		})
	})

})
