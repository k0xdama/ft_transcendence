import { validateEmail, validateUsername, validatePassword } from '../utils/validators.js';
import { db } from '../config/db.js';
import {
	ValidationError,
	EmailAlreadyExistsError,
	UsernameAlreadyExistsError,
	InvalidCredentialsError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
// ***** DEBUT BLOC ANTOINE *********************************************************
import axios from 'axios';

// Configuration
const PLAYER_SERVICE_URL = process.env.PLAYER_SERVICE_URL || 'http://player:3001';
const SERVICE_SECRET = process.env.SERVICE_SECRET || 'change-me';

async function createPlayerProfile(userData) {
	try {
		console.log("createPlayerProfil : [username] -> ", userData.username);
		const response = await axios.post(`${PLAYER_SERVICE_URL}/players`, userData, {
			timeout: 5000,
			headers: { 'service-token': SERVICE_SECRET }
		});
		return response.data;
	} catch (error) {
		console.error('❌ No answer from player service:', error.message);
		throw error;
	}
}
// ***** FIN BLOC ANTOINE *********************************************************

function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

class AuthService {
	async register({ email, username, password }) {
		validateEmail(email);
		validateUsername(username);
		validatePassword(password);

		const passwordHash = await bcrypt.hash(password, 10);

		try {
			const newUser = await db.one(
				`INSERT INTO auth.users(email, username, password_hash)
				VALUES($1, $2, $3)
				RETURNING id, email, username`,
				[email, username, passwordHash]
			);

			// ***** DEBUT BLOC ANTOINE *********************************************************
			console.log(`✅ User created in auth schema: ${newUser.username} (${newUser.id})`);

			// Créer le profil dans player.users
			try {
				const playerProfile = await createPlayerProfile({
					auth_user_id: newUser.id,
					username: newUser.username,
					email: newUser.email
				});

				console.log(`✅ Player profile created: id=${playerProfile.auth_user_id}, username=${playerProfile.username}`);

			} catch (playerError) {
				console.error('❌ Failed to create player profile:', playerError.message);
				
				// Rollback : supprimer l'utilisateur auth si le profil player échoue
				await db.none('DELETE FROM auth.users WHERE id = $1', [newUser.id]);
				
				throw new Error('Registration failed - player service unavailable');
			}
			console.log(`register (auth-service-class.js) [username] -> ${newUser.username}`);
			// ✅ RETOURNER les données (pas de res.json ici)
			return newUser;
			// ***** FIN BLOC ANTOINE *********************************************************
		}
		catch (error) {
			if (error.code === '23505') {
				if (error.constraint === 'users_email_key') // <table>_<column>_key
					throw new EmailAlreadyExistsError();
				if (error.constraint === 'users_username_key') // <table>_<column>_key
					throw new UsernameAlreadyExistsError();
			}
			if (error.code === '23514') {
				throw new ValidationError('Invalid data format');
			}
			throw error;
		}
	}

	async login(identifier, password) {
		if (!identifier || !password)
			throw new InvalidCredentialsError('Identifier and password are required');

		const user = await db.oneOrNone(
			`SELECT id, email, username, password_hash
			FROM auth.users
			WHERE email = $1 OR username = $1`,
			[identifier]
		);
		if (!user) {
			throw new InvalidCredentialsError();
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);
		if (!isValidPassword) {
			throw new InvalidCredentialsError();
		}

		const refreshToken = crypto.randomBytes(64).toString('hex');
		const tokenHash = hashToken(refreshToken);

		await db.none(
			`INSERT INTO auth.refresh_tokens (user_id, token_hash, expires_at)
			VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
			[user.id, tokenHash]
		);

		return {
			user: { id: user.id, email: user.email, username: user.username },
			refreshToken	// raw token sent via cookies
		};
	}

	async refresh(refreshToken) {
		if (!refreshToken)
			throw new InvalidCredentialsError('Refresh token is required');

		const tokenHash = hashToken(refreshToken);

		const record = await db.oneOrNone(
			`SELECT rt.id AS token_id, u.id, u.email, u.username
			FROM auth.refresh_tokens rt
			JOIN auth.users u ON u.id = rt.user_id
			WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
			[tokenHash]
		);
		if (!record)
			throw new InvalidCredentialsError('Invalid or expired refresh token');

		const newRefreshToken = crypto.randomBytes(64).toString('hex');
		const newTokenHash = hashToken(newRefreshToken);

		await db.tx(async t => {	// atomic transaction (rotation) where t is a copy of db with context
			await t.none(
				`DELETE FROM auth.refresh_tokens WHERE id = $1`,
				[record.token_id]
			);

			await t.none(
				`INSERT INTO auth.refresh_tokens (user_id, token_hash, expires_at)
				VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
				[record.id, newTokenHash]
			);
		});

		return {
			user: { id: record.id, email: record.email, username: record.username },
			newRefreshToken
		};
	}

	async logout(refreshToken) {
		if (!refreshToken)
			return;

		const tokenHash = hashToken(refreshToken);

		const record = await db.oneOrNone(
			`DELETE FROM auth.refresh_tokens WHERE token_hash = $1 RETURNING user_id`,
			[tokenHash]
		);

		if (!record)
			return;
	}
}

export const authService = new AuthService();