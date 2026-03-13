/*
	Remplacer par un vrai appel HTTP au lobby-service quand service OK
	Il devra creer les lobby_sessions en DB lors de l'ouverture d'un lobby
*/

import { db } from '../config/db.js';

// ajouter @params: userId + accessToken quand lobby-service OK
export async function checkLobbyMembership(roomId) {
	// Mock: cree la session lobby en DB si elle n'existe pas
	await db.none(
		`INSERT INTO chat.lobby_sessions (room_id)
		VALUES ($1)
		ON CONFLICT (room_id) DO NOTHING`,
		[roomId]
	);

	return true;
}