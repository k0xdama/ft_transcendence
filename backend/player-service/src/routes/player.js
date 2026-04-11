import express from 'express';
import { db } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { deleteFile, isDefaultProfilePicture } from '../utils/fileHandler.js';
import upload, { UPLOAD_DIR, DEFAULT_PROFILE_PICTURE } from '../middleware/upload.js';

// Self-signed certs are used between services on the private docker network
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const AUTH_URL = process.env.AUTH_URL || 'https://auth:3000';
const CHAT_URL = process.env.CHAT_URL || 'https://chat:2000';

async function callService(url, options = {}) {
	const res = await fetch(url, options);
	if (!res.ok && res.status !== 204) {
		let message = `Upstream ${res.status}`;
		try {
			const body = await res.json();
			if (body?.error)
				message = body.error;
		} catch {
			/* default */
		}
		const err = new Error(message);
		err.status = res.status;
		throw err;
	}
	return res;
}

const router = express.Router();

// Headers injected by the API Gateway after JWT verification
router.use((req, res, next) => {
	const userId = req.headers['x-user-id'];
	if (!userId) {
		return res.status(401).json({ error: 'Missing user context' });
	}
	req.user = {
		id: userId,
		username: req.headers['x-user-username'],
		email: req.headers['x-user-email']
	};
	next();
});

// ========================================
// Sous-ressource : Photo de profil
// ========================================

router.post('/me/profile-picture', upload.single('profilePicture'), async (req, res) => {
	const playerId = req.user.id;

	console.log('===== PROFILE PICTURE UPLOAD =====');
    console.log(`Player ID: ${playerId}`);
    console.log(`File:`, req.file);

	try {
		const player = await db.oneOrNone(
			`SELECT id, pp_path
			FROM player.users
			WHERE auth_user_id = $1`,
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
			`UPDATE player.users
			SET pp_path = $1
			WHERE auth_user_id = $2
			RETURNING *`,
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
			`SELECT pp_path
			FROM player.users
			WHERE auth_user_id = $1`,
            [req.params.auth_user_id]
        );

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        if (!player.pp_path) {
            return res.status(404).json({ error: 'No profile picture' });
        }

        const filePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Profile picture file not found' });
        }

        res.sendFile(filePath);

    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
});

// ✅ RESTful : DELETE /players/:auth_user_id/profile-picture (supprimer)
router.delete('/me/profile-picture', async (req, res) => {
    const playerId = req.user.id;

    try {
        const player = await db.oneOrNone(
			`SELECT auth_user_id, pp_path
			FROM player.users
			WHERE auth_user_id = $1`,
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
			`UPDATE player.users
			SET pp_path = $1
			WHERE auth_user_id = $2`,
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
		const player = await db.oneOrNone(
			`SELECT *
			FROM player.users
			WHERE auth_user_id = $1`,
			[req.params.auth_user_id]//a voir si je peux et doit synchroniser les id de l'auth et du player
		);

		if (!player) {
      		return res.status(404).json({ error: 'Player not found' });
    	}

		console.log(`Player with auth_user_id : ${player.auth_user_id} username : ${player.username} in player schema`);
		res.status(200).json(player);

	} catch (error) {
		console.error('Error while fetching player : ', error);
		res.status(500).json({
			error : 'Failed to fetch player user in player schema'
		});
	}
});

router.delete('/me', async (req, res) => {

	try {
		const player = await db.oneOrNone(
			`SELECT auth_user_id, username, pp_path
			FROM player.users
			WHERE auth_user_id = $1`,
			[req.user.id]
		);
		
		if (!player) {
			return res.status(404).json({error : `Player not found`});
		}

		/*
			Step 1: delete from auth.users FIRST, so that the user can no
			longer log in even if a later step (player/chat/file) fails
			The ON DELETE CASCADE on auth.refresh_tokens takes care of
			revoking any active session.
		*/
		try {
			await callService(`${AUTH_URL}/internal/users/${player.auth_user_id}`, {
				method: 'DELETE'
			});
		} catch (err) {
			if (err.status !== 404) {
				console.error('Failed to delete from auth-service:', err.message);
				return res.status(502).json({ error: 'Failed to delete auth user' });
			}
			console.warn(`Auth user ${player.auth_user_id} was already missing, continuing`);
        }

		// Step 2: remove the row from player.users
		await db.none('DELETE FROM player.users WHERE auth_user_id = $1', [req.user.id]);

		// Step 3: purge chat data (messages, DMs, blocks)
		try {
			await callService(`${CHAT_URL}/internal/users/${player.auth_user_id}`, {
				method: 'DELETE'
			});
		} catch (err) {
			console.error('Failed to purge chat data:', err.message);
		}

		// Step 4: delete the profile picture file from disk
		if (player.pp_path && !isDefaultProfilePicture(player.pp_path)) {
			const filePath = path.join(UPLOAD_DIR, path.basename(player.pp_path));
			deleteFile(filePath);
		} else if (isDefaultProfilePicture(player.pp_path)) {
			console.log(`ℹ️  Player has default picture, skipping file deletion`);
		}

		console.log(`Player with auth_user_id : ${player.auth_user_id} username : ${player.username} email : ${req.user.email} was deleted across auth + player + chat schemas`);
		res.status(204).send(); // 204 No Content (suppression réussie)

	} catch (error) {
		console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
	}
});

router.patch('/me', async (req, res) => {
	const { username } = req.body;
	/*
		NOTE: email is owned by auth-service (not stored in player.users).
		Username is duplicated in auth.users and player.users, so it must
		be mirrored on auth-service via /internal on every change, otherwise
		login still works with the old value and the JWT snapshot ends up
		referring to a stale identity.
	*/

	try {
		const updates = [];
		const values = [];
		let paramIndex = 1;

		if (username !== undefined){
			updates.push(`username = $${paramIndex++}`);
			values.push(username);
		}

		if (updates.length === 0) {
			return res.status(400).json({ error: `No fields to update`});
		}

		// Snapshot the old row so we can rollback if the auth sync fails
		const oldPlayer = await db.oneOrNone(
			`SELECT username
			FROM player.users
			WHERE auth_user_id = $1`,
			[req.user.id]
		);
		if (!oldPlayer) {
			return res.status(404).json({ error: 'Player not found' });
		}

		values.push(req.user.id);

		const updatedPlayer = await db.one(
			`UPDATE player.users
			SET ${updates.join(', ')}
			WHERE auth_user_id = $${paramIndex}
			RETURNING *`,
			values
		);

		/*
			Mirror the change on auth.users. If this fails, rollback
			player.users so the two schemas stay consistent.
		*/
		if (username !== undefined) {
			try {
				await callService(`${AUTH_URL}/internal/users/${req.user.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});
			} catch (err) {
				await db.none(
					`UPDATE player.users
					SET username = $1
					WHERE auth_user_id = $2`,
					[oldPlayer.username, req.user.id]
				);

				console.error('Failed to sync username with auth-service, rolled back player.users:', err.message);

				// Forward a client-side upstream error (e.g. 400 'username taken')
				// as-is; fall back to 502 for anything else (upstream down, 5xx...)
				let	status = 502;
				if (err.status >= 400 && err.status < 500) {
					status = err.status;
				}
				return res.status(status).json({ error: err.message || 'Failed to sync with auth-service' });
			}
		}

		res.json(updatedPlayer);
	} catch (error) {
		console.error('Error updating player:', error);
        
        if (error.message.includes('No data returned')) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.status(500).json({ error: 'Failed to update player' });
	}
});//Cette technique plutot que de faire une query pour chaque parametre de a db et donc devoir remettre le meme pour ne pas changer le NULL, ici on ne modifie QUE les parametres dont on recois l'info, de plus on peut facilement rajouter de paramettre

// ========================================
// Système d'amitié
// ========================================

/**
 * Helper : Récupérer les IDs internes de deux utilisateurs
 */
async function getUserIds(userAuthId, friendAuthId) {
    const user = await db.oneOrNone(
		`SELECT id, username
		FROM player.users
		WHERE auth_user_id = $1`,
        [userAuthId]
    );
    
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }

    const friend = await db.oneOrNone(
        `SELECT id, username
		FROM player.users
		WHERE auth_user_id = $1 OR LOWER(username) = LOWER($1)`,
        [friendAuthId]
    );
    
    if (!friend) {
        throw { status: 404, message: 'Friend not found' };
    }

    return { user, friend };
}

async function didUserBlockedThem(requester_id, addressee_id) {

    const check = await db.oneOrNone(`
        SELECT requester_id, addressee_id FROM player.blocked
        WHERE requester_id = $1 AND addressee_id = $2`
        , [requester_id, addressee_id]
    );

    return check;//faudra check les value apres appel de cette fonction
}

/**
 * POST /players/:auth_user_id/friend-requests/:friend_auth_user_id
 * Envoyer une demande d'ami
 */
router.post('/me/friend-requests/:friend_auth_user_id', async (req, res) => {
    const userAuthId = req.user.id;
    const friendAuthId = req.params.friend_auth_user_id;

    console.log('===== FRIEND REQUEST =====');
    console.log(`From: ${userAuthId} → To: ${friendAuthId}`);

    try {
        const { user, friend } = await getUserIds(userAuthId, friendAuthId);

        // Vérifier si une relation existe déjà (dans les deux sens)
        const existing = await db.oneOrNone(`
            SELECT id, requester_id, addressee_id, status 
            FROM player.friendships 
            WHERE (requester_id = $1 AND addressee_id = $2)
               OR (requester_id = $2 AND addressee_id = $1)
        `, [user.id, friend.id]);

        if (existing) {
            // Si demande déjà envoyée par moi
            if (existing.requester_id === user.id) {
                if (existing.status === 'pending') {
                    return res.status(400).json({ error: 'Friend request already sent' });
                }
                if (existing.status === 'accepted') {
                    return res.status(400).json({ error: 'Already friends' });
                }
                if (existing.status === 'blocked') {
                    return res.status(403).json({ error: 'Cannot send friend request to this user' });
                }
            }
            
            // Si l'autre a déjà envoyé une demande (acceptation automatique)
            if (existing.requester_id === friend.id && existing.status === 'pending') {
                const friendship = await db.one(`
                    UPDATE player.friendships 
                    SET status = 'accepted', responded_at = NOW()
                    WHERE id = $1
                    RETURNING *
                `, [existing.id]);

                console.log(`✅ Friend request auto-accepted (mutual interest)`);

                return res.status(200).json({
                    message: 'Friend request automatically accepted',
                    friendship
                });
            }

            // Si déjà amis ou bloqué
            if (existing.status === 'accepted') {
                return res.status(400).json({ error: 'Already friends' });
            }
            if (existing.status === 'blocked') {
                return res.status(403).json({ error: 'Cannot send friend request' });
            }
        }

        // Créer la demande
        const friendship = await db.one(`
            INSERT INTO player.friendships (requester_id, addressee_id, status)
            VALUES ($1, $2, 'pending')
            RETURNING id, requester_id, addressee_id, status, requested_at
        `, [user.id, friend.id]);

        console.log(`✅ Friend request sent: ${user.username} → ${friend.username}`);

        res.status(201).json({
            message: 'Friend request sent',
            friendship
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

/**
 * POST /players/:auth_user_id/friend-requests/:friend_auth_user_id/accept
 * Accepter une demande d'ami
 */
router.post('/me/friend-requests/:friend_auth_user_id/accept', async (req, res) => {
    const userAuthId = req.user.id;
    const friendAuthId = req.params.friend_auth_user_id;

    console.log('===== ACCEPT FRIEND REQUEST =====');
    console.log(`User: ${userAuthId} accepting: ${friendAuthId}`);

    try {
        const { user, friend } = await getUserIds(userAuthId, friendAuthId);

        // Mettre à jour le statut (je suis addressee, l'autre est requester)
        const updated = await db.oneOrNone(`
            UPDATE player.friendships 
            SET status = 'accepted', responded_at = NOW()
            WHERE requester_id = $1 
              AND addressee_id = $2 
              AND status = 'pending'
            RETURNING *
        `, [friend.id, user.id]);

        if (!updated) {
            return res.status(404).json({ error: 'No pending friend request found' });
        }

        console.log(`✅ Friend request accepted: ${user.username} ← ${friend.username}`);

        res.json({
            message: 'Friend request accepted',
            friendship: updated
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error accepting friend request:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

/**
 * DELETE /players/:auth_user_id/friend-requests/:friend_auth_user_id
 * Refuser ou annuler une demande d'ami
 */
router.delete('/me/friend-requests/:friend_auth_user_id', async (req, res) => {
    const userAuthId = req.user.id;
    const friendAuthId = req.params.friend_auth_user_id;

    console.log('===== DECLINE/CANCEL FRIEND REQUEST =====');
    console.log(`User: ${userAuthId}, Friend: ${friendAuthId}`);

    try {
        const { user, friend } = await getUserIds(userAuthId, friendAuthId);

        // Supprimer la demande (que je sois requester ou addressee)
        const deleted = await db.result(`
            DELETE FROM player.friendships 
            WHERE status = 'pending'
              AND ((requester_id = $1 AND addressee_id = $2)
                OR (requester_id = $2 AND addressee_id = $1))
        `, [user.id, friend.id]);

        if (deleted.rowCount === 0) {
            return res.status(404).json({ error: 'No pending friend request found' });
        }

        console.log(`✅ Friend request declined/cancelled`);

        res.status(200).json({ message: 'Friend request declined/cancelled' });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error declining friend request:', error);
        res.status(500).json({ error: 'Failed to decline friend request' });
    }
});

/**
 * GET /players/:auth_user_id/friends
 * Récupérer la liste d'amis (acceptés)
 */
router.get('/me/friends', async (req, res) => {
    console.log('===== GET FRIENDS LIST =====');
    console.log(`User: ${req.user.id}`);

    try {
        const friends = await db.any(`
            SELECT
                u.id,
                u.auth_user_id,
                u.username,
                u.pp_path,
                CASE
                    WHEN f.requester_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
                    THEN f.requested_at
                    ELSE f.responded_at
                END as friends_since
            FROM player.friendships f
            JOIN player.users u ON (
                CASE
                    WHEN f.requester_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
                    THEN f.addressee_id
                    ELSE f.requester_id
                END = u.id
            )
            WHERE f.status = 'accepted'
              AND (f.requester_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
                OR f.addressee_id = (SELECT id FROM player.users WHERE auth_user_id = $1))
            ORDER BY friends_since DESC
        `, [req.user.id]);

        console.log(`✅ Found ${friends.length} friends`);

        res.json({
            count: friends.length,
            friends
        });

    } catch (error) {
        console.error('❌ Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

/**
 * GET /players/:auth_user_id/friend-requests/pending
 * Récupérer les demandes d'amis en attente (reçues)
 */
router.get('/me/friend-requests/pending', async (req, res) => {
    console.log('===== GET PENDING FRIEND REQUESTS =====');
    console.log(`User: ${req.user.id}`);

    try {
        const requests = await db.any(`
            SELECT
                u.id,
                u.auth_user_id,
                u.username,
                u.pp_path,
                f.requested_at
            FROM player.friendships f
            JOIN player.users u ON f.requester_id = u.id
            WHERE f.addressee_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
              AND f.status = 'pending'
            ORDER BY f.requested_at DESC
        `, [req.user.id]);

        console.log(`✅ Found ${requests.length} pending requests`);

        res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('❌ Error fetching pending requests:', error);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

/**
 * GET /players/:auth_user_id/friend-requests/sent
 * Récupérer les demandes d'amis envoyées (en attente)
 */
router.get('/me/friend-requests/sent', async (req, res) => {
    console.log('===== GET SENT FRIEND REQUESTS =====');
    console.log(`User: ${req.user.id}`);

    try {
        const requests = await db.any(`
            SELECT
                u.id,
                u.auth_user_id,
                u.username,
                u.pp_path,
                f.requested_at
            FROM player.friendships f
            JOIN player.users u ON f.addressee_id = u.id
            WHERE f.requester_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
              AND f.status = 'pending'
            ORDER BY f.requested_at DESC
        `, [req.user.id]);

        console.log(`✅ Found ${requests.length} sent requests`);

        res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error('❌ Error fetching sent requests:', error);
        res.status(500).json({ error: 'Failed to fetch sent requests' });
    }
});

/**
 * DELETE /players/:auth_user_id/friends/:friend_auth_user_id
 * Supprimer un ami
 */
router.delete('/me/friends/:friend_auth_user_id', async (req, res) => {
    const userAuthId = req.user.id;
    const friendAuthId = req.params.friend_auth_user_id;

    console.log('===== REMOVE FRIEND =====');
    console.log(`User: ${userAuthId}, Friend: ${friendAuthId}`);

    try {
        const { user, friend } = await getUserIds(userAuthId, friendAuthId);

        // Supprimer l'amitié (dans les deux sens)
        const deleted = await db.result(`
            DELETE FROM player.friendships 
            WHERE status = 'accepted'
              AND ((requester_id = $1 AND addressee_id = $2)
                OR (requester_id = $2 AND addressee_id = $1))
        `, [user.id, friend.id]);

        if (deleted.rowCount === 0) {
            return res.status(404).json({ error: 'Friendship not found' });
        }

        console.log(`✅ Friend removed: ${user.username} ↔ ${friend.username}`);

        res.status(200).json({ message: 'Friend removed successfully' });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error removing friend:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

/**
 * POST /players/:auth_user_id/blocked/:blocked_auth_user_id
 * Bloquer un utilisateur
 */
router.post('/me/blocked/:blocked_auth_user_id', async (req, res) => {
    const userAuthId = req.user.id;//le demandeur
    const blockedAuthId = req.params.blocked_auth_user_id;//la cible

    console.log('===== BLOCK USER =====');
    console.log(`User: ${userAuthId} blocking: ${blockedAuthId}`);

    try {
        const { user, friend: blocked } = await getUserIds(userAuthId, blockedAuthId);//donne les id serials correpondants

        const   check = await didUserBlockedThem(user.id, blocked.id);//check si block existe dans ce sens

        if (check && check.requester_id === user.id && check.addressee_id === blocked) {
            return res.status(200).json({ message: 'User already blocked' });
        }

        // Vérifier si une relation existe pour savoir si on la met en status blocked PEUT ETRE ENLEVER CA
        const existing_friendship = await db.oneOrNone(`
            SELECT id, requester_id, addressee_id, status 
            FROM player.friendships 
            WHERE (requester_id = $1 AND addressee_id = $2)
               OR (requester_id = $2 AND addressee_id = $1)
        `, [user.id, blocked.id]);

        //mettre dans la table blocked que user a bloque l'autre
        await db.none(`
            INSERT INTO player.blocked (requester_id, addressee_id, requested_at) 
            VALUES ($1, $2, NOW())`,
            [user.id, blocked.id]

        );
        console.log(`✅ User blocked`);

        if (existing_friendship) {
            // Si la relation existe, la mettre à jour en blocked
            await db.none(`
                UPDATE player.friendships 
                SET status = 'blocked', responded_at = NOW()
                WHERE id = $1
            `, [existing_friendship.id]);

            console.log(`✅ (updated existing relationship)`);
        } 
        
        //methode nulle car si en face il unblock alors il pourra demander amitie alors que j'ai block mieux vaut check au niveau de la creation d'amitie
        // else {
        //     // Sinon, créer une nouvelle entrée
        //     await db.none(`
        //         INSERT INTO player.friendships (requester_id, addressee_id, status, responded_at)
        //         VALUES ($1, $2, 'blocked', NOW())
        //     `, [user.id, blocked.id]);

        //     console.log(`✅ User blocked (new entry)`);
        // }

        res.status(200).json({ message: 'User blocked successfully' });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error blocking user:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

/**
 * DELETE /players/:auth_user_id/blocked/:blocked_auth_user_id
 * Débloquer un utilisateur
 */
router.delete('/me/blocked/:blocked_auth_user_id', async (req, res) => {
    const userAuthId = req.user.id;
    const blockedAuthId = req.params.blocked_auth_user_id;

    console.log('===== UNBLOCK USER =====');
    console.log(`User: ${userAuthId} unblocking: ${blockedAuthId}`);

    try {
        const { user, friend: blocked } = await getUserIds(userAuthId, blockedAuthId);//donne les id serials correpondants

        const   check = await didUserBlockedThem(user.id, blocked.id);//check si block existe dans ce sens

        if (!check) {
            return res.status(200).json({ message: 'User not blocked' });
        }

        const   check_reverse = await didUserBlockedThem(blocked.id, user.id);//check si block existe dans ce sens

        // Vérifier si une relation existe pour savoir si on la met en status blocked PEUT ETRE ENLEVER CA
        const existing_friendship = await db.oneOrNone(`
            SELECT id, requester_id, addressee_id 
            FROM player.friendships 
            WHERE (requester_id = $1 AND addressee_id = $2)
               OR (requester_id = $2 AND addressee_id = $1)
        `, [user.id, blocked.id]);

        const deleted = await db.result(`
            DELETE FROM player.blocked 
            WHERE requester_id = $1 
              AND addressee_id = $2
        `, [user.id, blocked.id]
    );//delete le bloquage dans ce sens

        if (deleted.rowCount === 0) {
            return res.status(404).json({ error: 'User is not blocked' });
        }

        console.log(`✅ User unblocked`);

        if (existing_friendship && !check_reverse) {
            // Si la relation existe, et que les deux side ne bloque pas on enleve le status blocked
            await db.none(`
                UPDATE player.friendships 
                SET status = 'accepted', responded_at = NOW()
                WHERE id = $1
            `, [existing_friendship.id]);

            console.log(`✅ (updated existing relationship)`);
        }

        res.status(200).json({ message: 'User unblocked successfully' });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error unblocking user:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
});

/**
 * GET /players/:auth_user_id/blocked
 * Récupérer la liste des utilisateurs bloqués
 */
router.get('/me/blocked', async (req, res) => {
    console.log('===== GET BLOCKED USERS =====');
    console.log(`User: ${req.user.id}`);

    try {
        const blocked = await db.any(`
            SELECT
                u.id,
                u.auth_user_id,
                u.username,
                u.pp_path,
                b.requested_at as blocked_at
            FROM player.blocked b
            JOIN player.users u ON b.addressee_id = u.id
            WHERE b.requester_id = (SELECT id FROM player.users WHERE auth_user_id = $1)
            
        `, [req.user.id]);//une mine d'or de vocabulaire sql ce call au passage ligne fin tej ORDER BY f.responded_at DESC

        console.log(`✅ Found ${blocked.length} blocked users`);

        res.json({
            count: blocked.length,
            blocked
        });

    } catch (error) {
        console.error('❌ Error fetching blocked users:', error);
        res.status(500).json({ error: 'Failed to fetch blocked users' });
    }
});

/**
 * GET /players/:auth_user_id/friends/:friend_auth_user_id/mutual
 * Récupérer les amis en commun avec un ami
 */
router.get('/me/friends/:friend_auth_user_id/mutual', async (req, res) => {
    const userAuthId = req.user.id;
    const friendAuthId = req.params.friend_auth_user_id;

    console.log('===== GET MUTUAL FRIENDS =====');
    console.log(`User: ${userAuthId}, Friend: ${friendAuthId}`);

    try {
        const { user, friend } = await getUserIds(userAuthId, friendAuthId);

        // Vérifier que les deux sont amis
        const areFriends = await db.oneOrNone(`
            SELECT id FROM player.friendships 
            WHERE status = 'accepted'
              AND ((requester_id = $1 AND addressee_id = $2)
                OR (requester_id = $2 AND addressee_id = $1))
        `, [user.id, friend.id]);

        if (!areFriends) {
            return res.status(403).json({ error: 'You must be friends to see mutual friends' });
        }

        // Récupérer les amis en commun
        const mutualFriends = await db.any(`
            SELECT DISTINCT
                u.id,
                u.auth_user_id,
                u.username,
                u.pp_path
            FROM player.users u
            WHERE u.id IN (
                -- Amis de l'utilisateur
                SELECT CASE 
                    WHEN f1.requester_id = $1 THEN f1.addressee_id 
                    ELSE f1.requester_id 
                END
                FROM player.friendships f1
                WHERE f1.status = 'accepted'
                  AND (f1.requester_id = $1 OR f1.addressee_id = $1)
            )
            AND u.id IN (
                -- Amis de l'ami
                SELECT CASE 
                    WHEN f2.requester_id = $2 THEN f2.addressee_id 
                    ELSE f2.requester_id 
                END
                FROM player.friendships f2
                WHERE f2.status = 'accepted'
                  AND (f2.requester_id = $2 OR f2.addressee_id = $2)
            )
            AND u.id != $1  -- Exclure l'utilisateur lui-même
            AND u.id != $2  -- Exclure l'ami
            ORDER BY u.username
        `, [user.id, friend.id]);

        console.log(`✅ Found ${mutualFriends.length} mutual friends`);

        res.json({
            count: mutualFriends.length,
            mutual_friends: mutualFriends
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('❌ Error fetching mutual friends:', error);
        res.status(500).json({ error: 'Failed to fetch mutual friends' });
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