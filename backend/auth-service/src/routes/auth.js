import express from 'express';
import {db} from '../db/queries.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { email, username, password } = req.body;

		const userExist = await db.oneOrNone(
			'SELECT id FROM auth.users WHERE email = $1',
			[email]
		);
		if (userExist) {
			return res.status(400).json({ error: 'This email is linked to an existing account'});
		}
		const newUser = await db.one(
			'INSERT INTO auth.users(email, username, password) VALUES($1, $2, $3) RETURNING id, email, username',
			[email, username, password]
		);
		return res.status(201).json({ message: `${newUser.username}'s account has been successfully created!`, user: newUser});
	}
	catch (error)
	{
		console.error('Register: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
})

export default router;