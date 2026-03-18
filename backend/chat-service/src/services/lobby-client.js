import { db } from '../config/db.js';

export async function checkLobbyMembership(roomId, userId, accessToken) {
	// Mock: cree la session lobby en DB si elle n'existe pas
	await db.none(
		`INSERT INTO chat.lobby_sessions (room_id)
		VALUES ($1)
		ON CONFLICT (room_id) DO NOTHING`,
		[roomId]
	);

	return true;
}