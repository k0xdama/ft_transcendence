import 	express from 	'express';
import	{ db } 	from	'../db/queries.js';

import	path 	from	'path';
import { deleteFile, isDefaultProfilePicture } from '../utils/fileHandler.js';
import upload, { UPLOAD_DIR, DEFAULT_PROFILE_PICTURE } from '../middleware/upload.js';

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


//WARN REST on doit avoir les nom au pluriel voir conv avec claude
router.post('/', verifyServiceToken, async (req, res) => {// WARN route de la methode a changer carla convention REST implique deja que post creer donc on a juste post / pas post/create
	const	{auth_user_id, username, email} = req.body;//A CHANGER SI RAJOUTE DES PARAMS DANS LA DB
	
	console.log('===== PLAYER CREATE REQUEST =====');
    console.log(`Received : id = ${auth_user_id}, unsername = ${username}, email = ${email}`);

	if(!auth_user_id || !username || !email){
		return	res.status(400).json({error : 'Missing required field'});
	}

	try {
		//WARN avant que la partie auth fasse appel a cette requete elle verifie deja si il existe deja un profil donc arrive ici on se que le profil n'existe pas a voir si on rajoute une deuxieme verif
		const	newPlayerUsers = await db.one(
			'INSERT INTO player.users (auth_user_id, username, email, pp_path, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, created_at',
			[auth_user_id, username, email, DEFAULT_PROFILE_PICTURE]
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

// ========================================
// Sous-ressource : Photo de profil
// ========================================

router.post('/:auth_user_id/profile-picture', upload.single('profilePicture'), async (req, res) => {
	const	playerId = req.params.auth_user_id;

	console.log('===== PROFILE PICTURE UPLOAD =====');
    console.log(`Player ID: ${playerId}`);
    console.log(`File:`, req.file);

	try {
		const player = await db.oneOrNone(
            'SELECT id, pp_path FROM player.users WHERE auth_user_id = $1',
            [playerId]
        );

		if (!player) {
            if (req.file) {
                deleteFile(req.file.path);
            }
            return res.status(404).json({ error: 'Player not found' });
        }

		if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

		if (player.pp_path && !isDefaultProfilePicture(player.pp_path)) {
            const oldFilePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));
            deleteFile(oldFilePath);
            console.log(`🗑️  Old profile picture deleted`);
        } else if (isDefaultProfilePicture(player.pp_path)) {
            console.log(`ℹ️  Previous picture was default, no deletion needed`);
        }

		const relativePath = `/uploads/profilePictures/${req.file.filename}`;

        const updatedPlayer = await db.one(
            'UPDATE player.users SET pp_path = $1 WHERE auth_user_id = $2 RETURNING *',
            [relativePath, playerId]
        );

		console.log(`✅ Profile picture updated for player ${updatedPlayer.id}`);

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            player: updatedPlayer,
            file: {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: relativePath
            }
		});

	} catch (error) {

		console.error('❌ Error uploading profile picture:', error);
        
        if (req.file) {
            deleteFile(req.file.path);
        }

        res.status(500).json({ error: 'Failed to upload profile picture' });
	}
});

// ✅ RESTful : GET /players/:auth_user_id/profile-picture (récupérer)
router.get('/:auth_user_id/profile-picture', async (req, res) => {
    try {
        const player = await db.oneOrNone(
            'SELECT pp_path FROM player.users WHERE auth_user_id = $1',
            [req.params.auth_user_id]
        );

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        if (!player.pp_path) {
            return res.status(404).json({ error: 'No profile picture' });
        }

        // Redirection vers le fichier statique
        res.redirect(player.pp_path);

    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
});

// ✅ RESTful : DELETE /players/:auth_user_id/profile-picture (supprimer)
router.delete('/:auth_user_id/profile-picture', async (req, res) => {
    const playerId = req.params.auth_user_id;

    try {
        const player = await db.oneOrNone(
            'SELECT auth_user_id, pp_path FROM player.users WHERE auth_user_id = $1',
            [playerId]
        );

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

		if (isDefaultProfilePicture(player.pp_path)) {
            return res.status(400).json({ 
                error: 'Already using default profile picture',
                message: 'No custom picture to delete'
            });
        }

        if (!player.pp_path) {
            return res.status(404).json({ error: 'No profile picture to delete' });
        }

        const filePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));
        deleteFile(filePath);

		await db.none(
            'UPDATE player.users SET pp_path = $1 WHERE auth_user_id = $2',
            [DEFAULT_PROFILE_PICTURE, playerId]
        );

        console.log(`✅ Profile picture reset to default for player ${player.auth_user_id}`);

        res.status(200).json({  // ✅ 200 au lieu de 204 pour renvoyer un message
            message: 'Profile picture deleted, reset to default',
            pp_path: DEFAULT_PROFILE_PICTURE
        });

    } catch (error) {
        console.error('❌ Error deleting profile picture:', error);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
});

// ========================================
// CRUD de base sur /players
// ========================================




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

		if (player.pp_path && !isDefaultProfilePicture(player.pp_path)) {
            const filePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));
            deleteFile(filePath);
        } else if (isDefaultProfilePicture(player.pp_path)) {
            console.log(`ℹ️  Player has default picture, skipping file deletion`);
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
});//Cette technique plutot que de faire une query pour chaque parametre de a db et donc devoir remettre le meme pour ne pas changer le NULL, ici on ne modifie QUE les parametres dont on recois l'info, de plus on peut facilement rajouter de paramettre




// SON TRUC
export	default	router;
// SON TRUC

// MON TRUC
//router.listen()
// MON TRUC

// revoir sidb.one catch toute les infos de auth.users et completer la demande de creation cote auth et faire la creation cote player
// recheck tout et se lancer dans la creation des methodes