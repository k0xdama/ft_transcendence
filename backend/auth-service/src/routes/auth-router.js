import express from 'express';
import { register, login, logout } from '../controllers/auth-controller.js';
import { refresh, testAccessToken } from '../controllers/token-controller.js';

const router = express.Router();

// ─── Authentication ───────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// ─── Token Management ─────────────────────────────────────────────────────
router.post('/refresh', refresh);
router.get('/test', testAccessToken);

export default router;
