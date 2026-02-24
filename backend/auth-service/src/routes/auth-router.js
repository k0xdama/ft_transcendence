import express from 'express';
import { register, login, logout, testToken } from '../controllers/auth.js';
import { refresh } from '../controllers/refresh-token.js';
import { verifyToken } from '../middleware/verify-token.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/test', verifyToken, testToken);

export default router;