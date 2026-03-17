import jwt from 'jsonwebtoken';
import fs from 'fs';

const JWT_SECRET = fs.readFileSync('/run/secrets/jwt_access', 'utf8').trim();

export function authGuard(req, res, next) {
	const token = req.cookies?.access_token;

	if (!token) {
		return res.status(401).json({ error: 'No token provided' });
	}

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(403).json({error: 'Invalid or expired token'})
	}
}
