// ANSI
const RESET	= '\x1b[0m';
const ERR	= '\x1b[1;31m';	// Bold red
const SVC  = '\x1b[1;96m';	// Bold bright-cyan  (api-gateway)

/*
	Styled terminal error log

	Output:	error: api-gateway: <reason>
			error: api-gateway: <reason>: <detail>
*/
export function logError(reason, detail) {
	const prefix = `${ERR}error${RESET}: ${SVC}api-gateway${RESET}: `;

	if (detail !== undefined) {
		console.log(`${prefix}${reason}:`, detail);
	} else {
		console.log(`${prefix}${reason}`);
	}
}
