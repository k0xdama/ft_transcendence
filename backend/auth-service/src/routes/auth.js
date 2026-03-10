import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/queries.js';
import { generateAccessToken } from '../utils/jwt.js';
import { verifyToken } from '../middleware/verify-token.js';

//const axios = require('axios');
import	axios from 'axios';

const router = express.Router();

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

router.post('/register', async (req, res) => {
	try {
		const { email, username, password } = req.body;

		const emailExist = await db.oneOrNone(
			'SELECT id FROM auth.users WHERE email = $1',
			[email]
		);
		if (emailExist) {
			return res.status(400).json({ error: 'This email is linked to an existing account' });
		}

		const usernameExist = await db.oneOrNone(
			'SELECT id FROM auth.users WHERE username = $1',
			[username]
		);
		if (usernameExist) {
			return res.status(400).json({ error: 'This username is already taken' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = await db.one(
			'INSERT INTO auth.users(email, username, password) VALUES($1, $2, $3) RETURNING id, email, username',
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

});



router.post('/login', async (req, res) => {
	try {
		const { identifier, password } = req.body;

		const user = await db.oneOrNone(
			'SELECT id, email, username, password FROM auth.users WHERE email = $1 OR username = $1',
			[identifier]
		);
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		const accessToken = generateAccessToken(user);

		return res.status(200).json({
			message: 'Login successful',
			user: { id: user.id, email: user.email, username: user.username },
			accessToken
		});
	}
	catch (error) {
		console.error('Login: ', error);
		res.status(500).json({ error: 'Internal Server Error'});
	}
});

// token deletion on the client side
router.post('/logout', async (req, res) => {
	return res.status(200).json({ message: 'Logout successful' });
});

router.get('/test', verifyToken, (req, res) => {
	return res.status(200).json({ user: req.user });
});

export default router;