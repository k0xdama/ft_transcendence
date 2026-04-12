import express from 'express';
import { deleteUserInternal, updateUserInternal } from '../controllers/internal-controller.js';

/*
	These routes are mounted at '/internal' (NOT under '/auth')
	The API gateway only proxies '/api/auth/*' -> 'https://auth:3000/auth/*'
	so anything under '/internal' is unreachable from the public internet and
	can only be called by other services on the private 'triple_network'
*/
const router = express.Router();

// ─── Internal User Management ─────────────────────────────────────────────
router.delete('/users/:id', deleteUserInternal);	// called by player-service on account deletion
router.patch('/users/:id', updateUserInternal);		// called by player-service on username update

export default router;
