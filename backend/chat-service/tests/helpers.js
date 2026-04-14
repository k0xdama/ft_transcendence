import jwt from 'jsonwebtoken';
import fs from 'fs';

const accessToken = fs.readFileSync('/run/secrets/jwt_signing_key', 'utf8').trim();

export const userA = {
	id: '00000000-0000-0000-0000-000000000001',
	username: 'user_a'
};

export const userB = {
	id: '00000000-0000-0000-0000-000000000002',
	username: 'user_b'
};

export const userC = {
	id: '00000000-0000-0000-0000-000000000003',
	username: 'user_c'
};

export function generateTestToken(user) {
	return jwt.sign(
		{ id: user.id, username: user.username },
		accessToken,
		{ expiresIn: '15m' }
	);
}