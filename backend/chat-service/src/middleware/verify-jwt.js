/*	A déplacer dans l'API Gateway */

import fs from 'fs';
import jwt from 'jsonwebtoken';

const accessToken = fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

export function verifyAccessToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).json({ error: 'Authorization header is missing' });
	}
	if (!authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Authorization header must start with Bearer' });
	}

	const token = authHeader.split(' ')[1];	// 'Bearer <token>'
	if (!token) {
		return res.status(401).json({ error: 'Access token is missing after Bearer' });
	}

	try {
		const decoded = jwt.verify(token, accessToken);
		req.user = decoded;
		req.accessToken = token;	// forwarding to other services (inter-service REST)
		next();
	}
	catch (error) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}