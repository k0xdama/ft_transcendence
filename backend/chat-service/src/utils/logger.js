// ANSI
const RESET	= '\x1b[0m';
const ERR	= '\x1b[1;31m';	// Bold red
const SVC	= '\x1b[1;93m';	// Bold bright-yellow  (chat-service)

/*
	Styled terminal error log

	Output:	error: chat: <reason>
			error: chat: <reason>: <detail>
*/
export function logError(reason, detail) {
	const prefix = `${ERR}error${RESET}: ${SVC}chat${RESET}: `;

	if (detail !== undefined) {
		console.log(`${prefix}${reason}:`, detail);
	} else {
		console.log(`${prefix}${reason}`);
	}
}
