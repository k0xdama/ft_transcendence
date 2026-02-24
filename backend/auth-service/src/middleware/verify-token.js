import fs from 'fs';
import jwt from 'jsonwebtoken';

const JWT_ACCESS = fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

export function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) {
		return res.status(401).json({ error: 'No token provided' });
	}

	const token = authHeader.split(' ')[1];		// [0] 'Bearer' [1] <token>
	if (!token) {
		return res.status(401).json({ error: 'Invalid token format' });
	}

	try {
		const decoded = jwt.verify(token, JWT_ACCESS);
		req.user = decoded;
		next();
	}
	catch (error) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}