/*
	Remplacer par un vrai appel HTTP au lobby-service quand service OK
	Il devra creer les lobby_sessions en DB lors de l'ouverture d'un lobby
*/

import { db } from '../config/db.js';

export async function checkLobbyMembership(lobbyId, userId, accessToken) {
	// Mock: cree la session lobby en DB si elle n'existe pas
	await db.none(
		`INSERT INTO chat.lobby_sessions (lobby_id)
		VALUES ($1)
		ON CONFLICT (lobby_id) DO NOTHING`,
		[lobbyId]
	);

	return true;
}