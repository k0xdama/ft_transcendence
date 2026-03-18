import express from 'express';
import { extractUser } from '../middleware/extract-user.js';
import { blockUser, unblockUser } from '../controllers/block-controller.js';
import { sendLobbyMessage, getLobbyHistory } from '../controllers/lobby-controller.js';
import { createDM, sendDM, getDMHistory, getMyDMs } from '../controllers/dm-controller.js';

const router = express.Router();

router.use(extractUser);

// Block-Unblock
router.post('/block', blockUser);
router.delete('/unblock/:userId', unblockUser);

// Lobby messages (pre-during-post game)
router.post('/lobby/send', sendLobbyMessage);
router.get('/lobby/:roomId/history', getLobbyHistory);

// DM
router.post('/dm', createDM);
router.post('/dm/:conversationId/send', sendDM);
router.get('/dm/:conversationId/history', getDMHistory);
router.get('/dm', getMyDMs);

export default router;