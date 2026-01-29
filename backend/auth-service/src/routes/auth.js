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
			return res.status(400).json({ error: 'Cet email est lié à un compte déjà existant'});
		}
		const newUser = await db.one(
			'INSERT INTO auth.users(email, username, password) VALUES($1, $2, $3) RETURNING id, email, username',
			[email, username, password]
		);
		return res.status(201).json({ message: `Le compte de ${newUser.username} a bien été créé !`, user: newUser});
	}
	catch (error)
	{
		console.error('Register: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
})

export default router;