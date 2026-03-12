import express from 'express';
import { blockUser, unblockUser } from '../controllers/block-controller.js';
import { sendLobbyMessage } from '../controllers/lobby-controller.js'
import { verifyAccessToken } from '../middleware/verify-jwt.js';

const router = express.Router();

// Block
router.post('/block', verifyAccessToken, blockUser);
router.delete('/unblock/:userId', verifyAccessToken, unblockUser);

// Lobby messages (pre-game, game, post-game 2-3 min)
router.post('/lobby/send', verifyAccessToken, sendLobbyMessage);

export default router;