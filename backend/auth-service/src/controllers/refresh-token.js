import { authService } from '../services/auth.js';
import { generateAccessToken } from '../utils/jwt.js';

// POST /auth/refresh
export async function refresh(req, res) {
	try {
		const { refreshToken } = req.body;

		const { user, newRefreshToken } = await authService.refresh(refreshToken);

		const accessToken = generateAccessToken(user);

		return res.status(200).json({
			accessToken,
			refreshToken: newRefreshToken
		});
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.detail });
		}

		console.error('Refresh:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}