import express from 'express';
import { register, login, logout } from '../controllers/auth-controller.js';
import { refresh, testAccessToken } from '../controllers/token-controller.js';
import { verifyAccessToken } from '../middleware/verify-jwt.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/test', verifyAccessToken, testAccessToken);

export default router;