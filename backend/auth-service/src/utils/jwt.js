import jwt from 'jsonwebtoken';
import fs from 'fs';

const accessToken = fs.readFileSync('/run/secrets/jwt_access', 'utf-8').trim();

export function generateAccessToken(user) {
	return jwt.sign(
				{ id: user.id, email: user.email, username: user.username },
				accessToken,
				{ expiresIn: '10m' } // 20s pour test
	);
}