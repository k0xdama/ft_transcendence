// ANSI
const RESET	= '\x1b[0m';
const ERR	= '\x1b[1;31m';	// Bold red
const SVC	= '\x1b[1;95m';	// Bold bright-magenta  (auth-service)

/*
	Styled terminal error log

	Output:	error: auth: <reason>
			error: auth: <reason>: <detail>
*/
export function logError(reason, detail) {
	const prefix = `${ERR}error${RESET}: ${SVC}auth${RESET}: `;

	if (detail !== undefined) {
		console.log(`${prefix}${reason}:`, detail);
	} else {
		console.log(`${prefix}${reason}`);
	}
}