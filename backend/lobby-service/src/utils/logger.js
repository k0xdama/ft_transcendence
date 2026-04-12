// ANSI
const RESET	= '\x1b[0m';
const ERR	= '\x1b[1;31m';	// Bold red
const SVC	= '\x1b[1;92m';	// Bold bright-green  (lobby-service)

/*
	Styled terminal error log

	Output:	error: lobby: <reason>
			error: lobby: <reason>: <detail>
*/
function logError(reason, detail) {
	const prefix = `${ERR}error${RESET}: ${SVC}lobby${RESET}: `;
	if (detail !== undefined) {
		console.log(`${prefix}${reason}:`, detail);
	} else {
		console.log(`${prefix}${reason}`);
	}
}

export { logError };
