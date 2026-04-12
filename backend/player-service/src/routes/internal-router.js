import express from 'express';
import { db } from '../config/db.js';
import { DEFAULT_PROFILE_PICTURE } from '../middleware/upload.js';
import { logError } from '../utils/logger.js';

/*
	These routes are mounted at '/internal' (NOT under '/players')
	The API gateway only proxies '/api/players/*' -> 'https://player:3001/players/*'
	so anything under '/internal' is unreachable from the public internet and
	can only be called by other services on the private 'triple_network'
*/
const router = express.Router();

// POST /internal/users — called by auth-service on signup
router.post('/users', async (req, res) => {
	const { auth_user_id, username } = req.body;

	console.log('===== PLAYER CREATE REQUEST =====');
	console.log(`Received : id = ${auth_user_id}, username = ${username}`);

	if (!auth_user_id || !username){
		return res.status(400).json({error : 'Missing required field'});
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
		logError('failed to create player user', error);
		res.status(500).json({
			error : 'Failed to create player user in player schema'});
	}
});

// POST /internal/users/batch — called by chat-service to resolve usernames + avatars
router.post('/users/batch', async (req, res) => {
	const { userIds } = req.body;

	if (!Array.isArray(userIds) || userIds.length === 0)
		return res.status(400).json({ error: 'userIds must be a non-empty array' });

	try {
		const users = await db.manyOrNone(
			`SELECT auth_user_id, username, pp_path
			FROM player.users
			WHERE auth_user_id = ANY($1::uuid[])`,
			[userIds]
		);

		// Return as a map: { [auth_user_id]: { username, pp_path } }
		const map = {};
		for (const u of users)
			map[u.auth_user_id] = { username: u.username, pp_path: u.pp_path };

		res.json(map);
	} catch (error) {
		logError('failed to batch user lookup', error);
		res.status(500).json({ error: 'Failed to fetch users' });
	}
});

export default router;
