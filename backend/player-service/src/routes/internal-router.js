import express from 'express';
import { db } from '../config/db.js';
import { DEFAULT_PROFILE_PICTURE } from '../middleware/upload.js';

/*
	These routes are mounted at '/internal' (NOT under '/players')
	The API gateway only proxies '/api/players/*' -> 'https://player:3001/players/*'
	so anything under '/internal' is unreachable from the public internet and
	can only be called by other services on the private 'trio_network'
*/
const router = express.Router();

// POST /internal/users — called by auth-service on signup
router.post('/users', async (req, res) => {
	const { auth_user_id, username } = req.body;

	console.log('===== PLAYER CREATE REQUEST =====');
	console.log(`Received : id = ${auth_user_id}, username = ${username}`);

	if (!auth_user_id || !username){
		return	res.status(400).json({error : 'Missing required field'});
	}

	try {
		const newPlayerUsers = await db.one(
			`INSERT INTO player.users (auth_user_id, username, pp_path, created_at)
			VALUES ($1, $2, $3, NOW())
			RETURNING id, auth_user_id, username, created_at`,
			[auth_user_id, username, DEFAULT_PROFILE_PICTURE]
		);

		console.log(`Player user created auth_user_id : ${newPlayerUsers.auth_user_id} username : ${newPlayerUsers.username} in player schema`);
		res.status(201).json({
			message: 'Player profile created',
			player: newPlayerUsers
		});
	} catch (error) {
		console.error('Cannot create new user un player schema : ', error);
		res.status(500).json({
			error : 'Failed to create player user in player schema'});
	}
});

export default router;
