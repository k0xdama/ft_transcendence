import { authService } from '../services/auth.js';
import { generateAccessToken } from '../utils/jwt.js';
import { setRefreshCookie } from '../utils/cookies.js';

// POST /auth/refresh
export async function refresh(req, res) {
	try {
		const refreshToken = req.cookies.refreshToken;

		const { user, newRefreshToken } = await authService.refresh(refreshToken);
		
		const accessToken = generateAccessToken(user);
		setRefreshCookie(res, newRefreshToken);

		return res.status(200).json({ accessToken });
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.detail });
		}

		console.error('Refresh:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}