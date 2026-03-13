import express from 'express';
import { verifyAccessToken } from '../middleware/verify-jwt.js';
import { blockUser, unblockUser } from '../controllers/block-controller.js';
import { sendLobbyMessage, getLobbyHistory } from '../controllers/lobby-controller.js';
import {
	createDM, sendDM,
	getDMHistory, getMyDMs } from '../controllers/dm-controller.js';

const router = express.Router();

// Block-Unblock
router.post('/block', verifyAccessToken, blockUser);
router.delete('/unblock/:userId', verifyAccessToken, unblockUser);

// Lobby messages (pre-during-post game)
router.post('/lobby/send', sendLobbyMessage);
router.get('/lobby/:roomId/history', getLobbyHistory);
// router.post('/lobby/send', verifyAccessToken, sendLobbyMessage);
// router.get('/lobby/:roomId/history', verifyAccessToken, getLobbyHistory);

// DM messages
router.post('/dm', verifyAccessToken, createDM);
router.post('/dm/:conversationId/send', verifyAccessToken, sendDM);
router.get('/dm/:conversationId/history', verifyAccessToken, getDMHistory);
router.get('/dm', verifyAccessToken, getMyDMs);

export default router;