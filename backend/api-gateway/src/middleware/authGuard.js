import jwt from 'jsonwebtoken';
import fs from 'fs';

const JWT_SIGNING_KEY = fs.readFileSync('/run/secrets/jwt_signing_key', 'utf8').trim();

export function authGuard(req, res, next) {
	const accessToken = req.cookies?.accessToken;
	if (!accessToken)
		return res.status(401).json({ error: 'No token provided' });

	try {
		const payload = jwt.verify(accessToken, JWT_SIGNING_KEY);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({error: 'Invalid or expired token'})
	}
}
