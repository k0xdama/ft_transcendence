import express from 'express';
import { db } from '../config/db.js';
import { verifyToken } from '../middleware/verify-token.js';

const router = express.Router();

// router.post('/block', verifyToken, blockUser);
// router.post('/unblock/:userId', verifyToken, unblockUser);

router.post('/block', verifyToken, async(req, res) => {
	try {
		const blockedId = req.body;
		if (!blockedId) {
			return res.status(400).json({ error: 'Blocked user ID required' });
		}

		const blockerId = req.user.id;

		await db.none(
			`INSERT INTO chat.blocked_users (blocker_id, blocked_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING`,
			[blockerId, blockedId]
		);

		res.json({ success: true });
	}
	catch (error) {
		console.error('Block user: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
});

router.delete('/unblock/:userId', verifyToken, async(req, res) => {
	await db.none(
		`DELETE FROM chat.blocked_users
		WHERE blocker_id = $1 AND blocked_id = $2`,
		[req.user.id, req.params.userId]
	);

	res.json({ success: true });
});

export default router;