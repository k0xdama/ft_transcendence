import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { generateAccessToken } from '../utils/jwt.js';
import { verifyToken } from '../middleware/verify-token.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { email, username, password } = req.body;

		const emailExist = await db.oneOrNone(
			'SELECT id FROM auth.users WHERE email = $1',
			[email]
		);
		if (emailExist) {
			return res.status(400).json({ error: 'This email is linked to an existing account' });
		}

		const usernameExist = await db.oneOrNone(
			'SELECT id FROM auth.users WHERE username = $1',
			[username]
		);
		if (usernameExist) {
			return res.status(400).json({ error: 'This username is already taken' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = await db.one(
			'INSERT INTO auth.users(email, username, password_hash) VALUES($1, $2, $3) RETURNING id, email, username',
			[email, username, passwordHash]
		);

		return res.status(201).json({
			message: `${newUser.username}'s account has been successfully created!`,
			user: newUser
		});
	}
	catch (error) {
		console.error('Register: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
});

router.post('/login', async (req, res) => {
	try {
		const { identifier, password } = req.body;

		const user = await db.oneOrNone(
			'SELECT id, email, username, password_hash FROM auth.users WHERE email = $1 OR username = $1',
			[identifier]
		);
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		const accessToken = generateAccessToken(user);

		return res.status(200).json({
			message: 'Login successful',
			user: { id: user.id, email: user.email, username: user.username },
			accessToken
		});
	}
	catch (error) {
		console.error('Login: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
});

// token deletion on the client side
router.post('/logout', async (req, res) => {
	return res.status(200).json({ message: 'Logout successful' });
});

router.get('/test', verifyToken, (req, res) => {
	return res.status(200).json({ user: req.user });
});

export default router;