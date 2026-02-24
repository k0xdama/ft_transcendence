import { authService } from '../services/auth.js';
import { generateAccessToken } from '../utils/jwt.js';

// POST /auth/register
export async function register(req, res) {
	try {
		const { email, username, password } = req.body;
    
		const newUser = await authService.register({ email, username, password });
    
		return res.status(201).json({
			message: `${newUser.username}'s account has been successfully created!`,
			user: newUser
		});
	}
	catch (error) {
		if (error.isOperational) {	// ex: validation error, duplication...
			return res.status(error.statusCode).json({ error: error.detail });
		}

		console.error('Register:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// POST /auth/login
export async function login(req, res) {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password) {
			return res.status(400).json({ error: 'Identifier and password required' });
		}
    
		const { user, refreshToken } = await authService.login(identifier, password);
    
		const accessToken = generateAccessToken(user);
    
		return res.status(200).json({
			message: 'Login successful',
			user: user,
			accessToken,	// 15 min
			refreshToken	// 7 days
		});
	}
	catch (error) {
		if (error.isOperational) {
			return res.status(error.statusCode).json({ error: error.detail });
		}

		console.error('Login:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// POST /auth/logout
export async function logout(req, res) {
	try {
		const { refreshToken } = req.body;

		await authService.logout(refreshToken);

		return res.status(200).json({ message: 'Logout successful' });
	}
	catch (error) {
		console.error('Logout:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// GET /auth/test (debug route)
export async function testToken(req, res) {
	return res.status(200).json({ user: req.user });
}