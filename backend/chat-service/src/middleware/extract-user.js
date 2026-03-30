import jwt from 'jsonwebtoken';
import fs from 'fs';

const jwtSecret = fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

export function extractUser(req, res, next) {
	// Production path: headers injected by API Gateway after authGuard
	const id = req.headers['x-user-id'];
	if (id) {
		req.user = {
			id,
			email: req.headers['x-user-email'],
			username: req.headers['x-user-username']
		};
		return next();
	}

	// Test/direct path: JWT Bearer token
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const accessToken = authHeader.slice(7);
		const payload = jwt.verify(accessToken, jwtSecret);
		req.user = { id: payload.id, email: payload.email, username: payload.username };
		next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}
