import 	express from 	'express';
import	{ db } 	from	'../db/queries.js';

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

router.post('/create', verifyServiceToken, async (req, res) => {
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

router.get('/:id', async (req, res) => {

	try {
		const	player = await db.oneOrNone(
			'SELECT * FROM player.users WHERE id = $1',
			[req.params.id]//a voir si je peux et doit synchroniser les id de l'auth et du player
		);

		if (!player) {
      		return res.status(404).json({ error: 'Player not found' });
    	}

		res.json(player);

	} catch (error) {
		console.error('Error while fetching player : ', error);
		res.status(500).json({
			error : 'Failed to fetch player user in player schema'
		});
	}
});

// SON TRUC
export	default	router;
// SON TRUC

// MON TRUC
//router.listen()
// MON TRUC

// revoir sidb.one catch toute les infos de auth.users et completer la demande de creation cote auth et faire la creation cote player
// recheck tout et se lancer dans la creation des methodes