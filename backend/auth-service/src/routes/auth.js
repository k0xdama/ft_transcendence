import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/queries.js';

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

		const password_hash = await bcrypt.hash(password, 10);

		const newUser = await db.one(
			'INSERT INTO auth.users(email, username, password) VALUES($1, $2, $3) RETURNING id, email, username',
			[email, username, password_hash]
		);
c
		return res.status(201).json({
			message: `${newUser.username}'s account has been successfully created!`,
			user: newUser
		});
	}
	catch (error) {
		console.error('Register: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
})

export default router;