import express from 'express';
import { purgeUserData } from '../controllers/purge-controller.js';

/*
	These routes are mounted at '/internal' (NOT under '/chat')
	The API gateway only proxies '/api/chat/*' -> 'https://chat:2000/chat/*'
	so anything under '/internal' is unreachable from the public internet and
	can only be called by other services on the private 'trio_network'
*/
const router = express.Router();

// DELETE /internal/users/:userId — called by player-service on account deletion
router.delete('/users/:userId', purgeUserData);

export default router;
