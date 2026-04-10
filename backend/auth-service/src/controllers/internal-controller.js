import { authService } from '../class/auth-service-class.js';

// DELETE /internal/users/:id — called by player-service on account deletion
export async function deleteUserInternal(req, res) {
	try {
		await authService.deleteUser(req.params.id);
		return res.status(204).send();
	}
	catch (error) {
		if (error.isOperational)
			return res.status(error.statusCode).json({ error: error.reason });

		console.error('Internal deleteUser:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// PATCH /internal/users/:id — called by player-service when the profile is updated
export async function updateUserInternal(req, res) {
	try {
		const { username, email } = req.body;
		const updated = await authService.updateUser(req.params.id, { username, email });
		return res.status(200).json({ user: updated });
	}
	catch (error) {
		if (error.isOperational)
			return res.status(error.statusCode).json({ error: error.reason });

		console.error('Internal updateUser:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
