import express from 'express';
import { blockUser, unblockUser } from '../controllers/block-controller.js';
import { sendWsMessage, getChatWsHistory } from '../controllers/chat-ws-controller.js';
import { createDM, sendDM, getDMHistory, getMyDMs, markAsRead } from '../controllers/dm-controller.js';
import { getOnlineStatuses } from '../controllers/status-controller.js';

const router = express.Router();

router.use((req, res, next) => {
	const userId = req.headers['x-user-id'];
	if (!userId)
		return res.status(401).json({ error: 'Missing user context' });

	req.user = {
		id: userId,
		username: req.headers['x-user-username'],
		email: req.headers['x-user-email']
	};
	next();
});

// ─── Block-Unblock ────────────────────────────────────────────────────────
router.post('/block', blockUser);
router.delete('/unblock/:userId', unblockUser);

// ─── Chat WS messages (lobby → game → post-game) ──────────────────────────
router.post('/room/send', sendWsMessage);
router.get('/room/:lobbyId/history', getChatWsHistory);

// ─── DM ───────────────────────────────────────────────────────────────────
router.post('/dm', createDM);
router.post('/dm/:conversationId/send', sendDM);
router.patch('/dm/:conversationId/read', markAsRead);
router.get('/dm/:conversationId/history', getDMHistory);
router.get('/dm', getMyDMs);

// ─── Online status ───────────────────────────────────────────────────────
router.post('/status/online', getOnlineStatuses);

export default router;