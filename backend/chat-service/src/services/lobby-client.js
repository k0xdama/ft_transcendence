const LOBBY_SERVICE_URL = process.env.LOBBY_SERVICE_URL || 'http://lobby:3003';

export async function checkLobbyMembership(roomId, userId) {
	const response = await fetch(`${LOBBY_SERVICE_URL}/rooms/${roomId}/members/${userId}`);
	if (!response.ok)
		return false;

	const data = await response.json();
	return data.isMember === true;
}
