const SERVICE_COLORS = {
	Auth:	'#c084fc',
	Player:	'#82bbfc',
	Chat:	'#fffeaa',
	Lobby:	'#6ee7b7',
	Game:	'#fdba74',
};

// Maps each context name to its parent microservice color key
const CONTEXT_SERVICE = {
	Login:			'Auth',
	Register:		'Auth',
	Auth:			'Auth',
	UserProfile:	'Player',
	Friends:		'Player',
	FriendRequests:	'Player',
	DM:				'Chat',
	GameChat:		'Chat',
	LobbyChat:		'Chat',
	LobbySocket:	'Lobby',
	Game:			'Game',
};

/*
	Styled browser console error

	Output:	error: <context>: <reason>
			error: <context>: <reason>: <detail>
*/
export function logError(context, reason, detail) {
	const color = SERVICE_COLORS[CONTEXT_SERVICE[context]] ?? '#e2e8f0';
	const styles = [
		'color:#ef4444;font-weight:bold',	// "error"
		'',									// ":"
		`color:${color};font-weight:bold`,	// "<context>"
		'',									// ":"
	];

	if (detail !== undefined) {
		console.log(`%cerror%c: %c${context}%c: ${reason}:`, ...styles, detail);
	} else {
		console.log(`%cerror%c: %c${context}%c: ${reason}`, ...styles);
	}
}
