import 	express from 	'express';
import	{ db } 	from	'../db/queries.js';

import	path 	from	'path';
import { deleteFile } from '../utils/fileHandler.js';
import { UPLOAD_DIR } from '../middleware/upload.js';

//import { generateAccessToken } from '../../../auth-service/src/utils/jwt.js';//pas utilise pour le moment
//import { verifyToken } from '../../../auth-service/src/middleware/verify-token.js';//pas utilise pour le moment

const	router = express.Router();//on utilise router pour eviter de faire toutes les routes dans un meme fichier mais il faudra bien creer lke server.js qui contient 

// MON TRUC
//const	PORT = 3001; //si modif ca aussi modif le port exposed dans dockerfile
// MON TRUC

//const SERVICE_SECRET = process.env.SERVICE_SECRET || 'change-me-in-production';//token secret cunnu seulement des service permettant d'attester que c'est un service qui a fait la requete
//const SERVICE_SECRET = fs.readFileSync('/run/secrets/service_token', 'utf8').trim();//version avec les secrets a tester une fis que les test avec token hardcode marche car en env docker on vois les mdp donc aucun interet
const SERVICE_SECRET = 'change-me';//WARN A CHANGER PAR UNE LECTURE DU TOKEN DANS LES SECRETS


const	verifyServiceToken = (req, res, next) => {
	const	token = req.headers['service-token'];//on recup le token mis dans le header par auth WARN express convertit tout les headers en minuscule donc 'Service-token' devient 'service-token'
	
	if (token !== SERVICE_SECRET){
		return res.status(403).json({ error: `Invalid Service token yours is "${token}" the good one is "${SERVICE_SECRET}"`});
	}

	next();
};


// ========================================
// CRUD de base sur /players
// ========================================


//WARN REST on doit avoir les nom au pluriel voir conv avec claude
router.post('/', verifyServiceToken, async (req, res) => {// WARN route de la methode a changer carla convention REST implique deja que post creer donc on a juste post / pas post/create
	const	{auth_user_id, username, email} = req.body;//A CHANGER SI RAJOUTE DES PARAMS DANS LA DB
	
	console.log('===== PLAYER CREATE REQUEST =====');
    console.log(`Received : id = ${auth_user_id}, unsername = ${username}, email = ${email}`);

	if(!auth_user_id || !username || !email){
		return	res.status(400).json({error : 'Missing required field'});
	}

	try {
		//avant que la partie auth fasse appel a cette requete elle verifie deja si il existe deja un profil donc arrive ici on se que le profil n'existe pas
		const	newPlayerUsers = await db.one(
			'INSERT INTO player.users (auth_user_id, username, email, pp_path, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, created_at',
			[auth_user_id, username, email, '../../profilePictures/']
		);

		console.log(`Player user created auth_user_id : ${newPlayerUsers.auth_user_id} username : ${newPlayerUsers.username} in player schema`);
		res.status(201).json({
			message: 'Player profile created',
      		player: newPlayerUsers
		});
	} catch (error) {
		console.error('Cannot create new user un player schema : ', error);
		res.status(500).json({
			error : 'Failed to create player user in player schema'});
	}
});

router.get('/:auth_user_id', async (req, res) => { //WARN j'ai CHANGE CAR pas secu on ne met jamais de SERIAL dans une routes car c'est une faiblesse tres simpl a exploiter on met de l'UUID ici authUserId

	try {
		const	player = await db.oneOrNone(
			'SELECT * FROM player.users WHERE auth_user_id = $1',
			[req.params.auth_user_id]//a voir si je peux et doit synchroniser les id de l'auth et du player
		);

		if (!player) {
      		return res.status(404).json({ error: 'Player not found' });
    	}

		console.log(`Player with auth_user_id : ${player.auth_user_id} username : ${player.username} email : ${player.email} in player schema`);
		res.status(200).json(player);

	} catch (error) {
		console.error('Error while fetching player : ', error);
		res.status(500).json({
			error : 'Failed to fetch player user in player schema'
		});
	}
});

router.delete('/:auth_user_id' , async (req, res) => {

	try {
		const	player = await db.oneOrNone('SELECT auth_user_id, pp_path FROM player.users WHERE auth_user_id = $1;', [req.params.auth_user_id]);
		
		if (!player) {
			return res.status(404).json({error : `Player not found`});
		}

		if (player.pp_path) {
			const filePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));
			deleteFile(filePath);
		}

		await db.none('DELETE FROM player.users WHERE auth_user_id = $1', [req.params.auth_user_id]);

		console.log(`Player with auth_user_id : ${player.auth_user_id} username : ${player.username} email : ${player.email} was deleted from player.users in player schema`);
		res.status(204).send(); // 204 No Content (suppression réussie)

	} catch (error) {
		console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
	}
});

router.patch('/:auth_user_id', async (req, res) => {//WARN la verification de la validite des parametre doit se faire avent le patch
	const	{ username, email } = req.body;

	try {
		const	updates = [];
		const	values = [];
		let		paramIndex = 1;

		if(username !== undefined){
			updates.push(`username = $${paramIndex++}`);
			values.push(username);
		}
		if(email !== undefined){
			updates.push(`email = $${paramIndex++}`);
			values.push(email);
		}

		if (updates.length === 0) {
			return res.status(400).json({ error: `No fields to update`});
		}

		values.push(req.params.auth_user_id);

		const	updatedPlayer = await db.one(`UPDATE player.users SET ${updates.join(', ')} WHERE auth_user_id = $${paramIndex} RETURNING *`, values);//WARN on utilise bien id car paramIndex est un entier 

		res.json(updatedPlayer);
	} catch (error) {
		console.error('Error updating player:', error);
        
        if (error.message.includes('No data returned')) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.status(500).json({ error: 'Failed to update player' });
	}
});

// ========================================
// Sous-ressource : Photo de profil
// ========================================



// SON TRUC
export	default	router;
// SON TRUC

// MON TRUC
//router.listen()
// MON TRUC

// revoir sidb.one catch toute les infos de auth.users et completer la demande de creation cote auth et faire la creation cote player
// recheck tout et se lancer dans la creation des methodes