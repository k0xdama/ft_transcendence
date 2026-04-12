// ANSI
const RESET	= '\x1b[0m';
const ERR	= '\x1b[1;31m';	// Bold red
const SVC	= '\x1b[1;94m';	// Bold bright-blue  (player-service)

/*
	Styled terminal error log

	Output:	error: player: <reason>
			error: player: <reason>: <detail>
*/
function logError(reason, detail) {
	const prefix = `${ERR}error${RESET}: ${SVC}player${RESET}: `;
	if (detail !== undefined) {
		console.log(`${prefix}${reason}:`, detail);
	} else {
		console.log(`${prefix}${reason}`);
	}
}

export { logError };
