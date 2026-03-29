import { authService } from '../services/auth-service.js';
import { generateAccessToken } from '../utils/jwt.js';
import { setRefreshCookie, setAccessCookie } from '../utils/cookies.js';

// POST /auth/refresh
export async function refresh(req, res) {
	try {
		const refreshToken = req.cookies.refreshToken;

		const { user, newRefreshToken } = await authService.refresh(refreshToken);
		
		const accessToken = generateAccessToken(user);
		setAccessCookie(res, accessToken);
		setRefreshCookie(res, newRefreshToken);

		return res.status(200).json({ user });
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.reason });
		}

		console.error('Refresh:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /auth/test (debug route)
export async function testAccessToken(req, res) {
	return res.status(200).json({ user: req.user });
}