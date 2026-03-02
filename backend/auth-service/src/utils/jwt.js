import jwt from 'jsonwebtoken';
import fs from 'fs';

const JWT_ACCESS = fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

export function generateAccessToken(user) {
	return jwt.sign(
				{ id: user.id, email: user.email, username: user.username },
				JWT_ACCESS,
				{ expiresIn: '15m' } // 20s pour test
	);
}