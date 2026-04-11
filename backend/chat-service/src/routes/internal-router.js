import express from 'express';
import { purgeUserData } from '../controllers/purge-controller.js';
import { internalBlockUser, internalUnblockUser } from '../controllers/internal-block-controller.js';

/*
	These routes are mounted at '/internal' (NOT under '/chat')
	The API gateway only proxies '/api/chat/*' -> 'https://chat:2000/chat/*'
	so anything under '/internal' is unreachable from the public internet and
	can only be called by other services on the private 'triple_network'
*/
const router = express.Router();

// DELETE /internal/users/:userId — called by player-service on account deletion
router.delete('/users/:userId', purgeUserData);

// POST /internal/block — called by player-service when a user blocks another
router.post('/block', internalBlockUser);

// DELETE /internal/unblock — called by player-service when a user unblocks another
router.delete('/unblock', internalUnblockUser);

export default router;
