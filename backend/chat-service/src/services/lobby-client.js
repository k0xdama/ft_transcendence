// const LOBBY_SERVICE_URL = 'http://lobby:2000';

export async function checkLobbyMembership(lobbyId, userId, accessToken) {
	// const response = await fetch(
	// 	`${LOBBY_SERVICE_URL}/lobby/rooms/${lobbyId}/members/${userId}`,
	// 	{
	// 		headers: { 'Authorization': `Bearer ${accessToken}` }
	// 	}
	// );

	// if (response.status === 404)
	// 	return false;

	// if (!response.ok)
	// 	throw new Error(`Lobby service responded with ${response.status}`);

	// const data = await response.json();
	// return data.isMember === true;
	return true;
}