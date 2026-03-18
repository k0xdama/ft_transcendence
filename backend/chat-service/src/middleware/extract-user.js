export function extractUser(req, res, next) {
	const id = req.headers['x-user-id'];
	const email = req.headers['x-user-email'];
	const username = req.headers['x-user-username'];

	if (!id) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	req.user = { id, email, username };
	next();
}
