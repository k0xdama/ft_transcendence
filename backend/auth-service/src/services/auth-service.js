import { validateEmail, validateUsername, validatePassword } from '../utils/validators.js';
import { db } from '../config/db.js';
import {
	EmailAlreadyExistsError,
	UsernameAlreadyExistsError,
	UserNotFoundError,			// To delete before correction
	InvalidPasswordError,		// To delete before correction
	InvalidCredentialsError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';


import	axios from 'axios';

// Configuration
//const PLAYER_SERVICE_URL = process.env.PLAYER_SERVICE_URL || 'http://player:3001';//version avec les env du docker compose.yml
const PLAYER_SERVICE_URL = 'http://player:3001';//const PLAYER_SERVICE_URL = process.env.PLAYER_SERVICE_URL || 'http://localhost:3000'; ici on rajoute aussi la possibilite de changer le port avec variable d'environement
//WARN comme le service player est dans un autre container ne pas utiliser localhost car lecolhost ici est le container de auth, il faut donc rentrer en dut ou utiliser des variables d'environements creees dans le docker compose.yml

//const SERVICE_SECRET = process.env.SERVICE_SECRET || 'change-me-in-production';//token secret cunnu seulement des service permettant d'attester que c'est un service qui a fait la requete
//const SERVICE_SECRET = fs.readFileSync('/run/secrets/service_token', 'utf8').trim();//version avec les secrets a tester une fis que les test avec token hardcode marche car en env docker on vois les mdp donc aucun interet
const SERVICE_SECRET = 'change-me';//WARN A CHANGER PAR UNE LECTURE DU TOKEN DANS LES SECRETS

async function createPlayerProfile(userData) {
	try	{
		const	response = await axios.post(`${PLAYER_SERVICE_URL}/players`, userData,
			{
				timeout: 5000,
				headers: {'Service-token': SERVICE_SECRET}
			}
		);
		return response.data;
	}
	catch (error) {
	console.error('No answer from player service : ', error);
	}
}

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

			console.log(`AVANT MON TC`);

			try {

				console.log(`DEBUT MON TC`);

				const	playerProfile = await createPlayerProfile({
					auth_user_id: newUser.id,//pas sur de ce paramettre dans la db auth il semble etre id UUID et il ne semble pas etre pris ici
					username: newUser.username,
					email: newUser.email
				});

				console.log(`Profil created in player schema id : ${playerProfile.player.id}`);//PAS SUR de la syntaxe
			}
			catch (error) {
				console.error('Failed to create profile in player schema : ', error);
			}

		console.log(`APRES MON TC`);

		return res.status(201).json({
			message: `${newUser.username}'s account has been successfully created!`,
			user: newUser
		});
	}
	catch (error) {
		console.error('Register: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
		}
		catch (error) {
			if (error.code === '23505') {
				if (error.constraint === 'users_email_key') // <table>_<column>_key
					throw new EmailAlreadyExistsError();
				if (error.constraint === 'users_username_key') // <table>_<column>_key
					throw new UsernameAlreadyExistsError();
			}
			throw error;
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
			// throw new InvalidCredentialsError();
			throw new UserNotFoundError();
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);
		if (!isValidPassword) {
			// throw new InvalidCredentialsError();
			throw new InvalidPasswordError();
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

		await db.none(
			`DELETE FROM auth.refresh_tokens WHERE token_hash = $1`,
			[tokenHash]
		);
	}
}

export const authService = new AuthService();