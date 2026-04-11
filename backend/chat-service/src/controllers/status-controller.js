import { redisClient } from '../config/redis.js';

export async function getOnlineStatuses(req, res) {
	const { userIds } = req.body;

	if (!Array.isArray(userIds) || userIds.length === 0)
		return res.status(400).json({ error: 'userIds array required' });

	try {
		const pipeline = redisClient.multi();
		for (const id of userIds)
			pipeline.sIsMember('users:online', id);

		const results = await pipeline.exec();

		const statuses = {};

		userIds.forEach((id, i) => {
			statuses[id] = results[i] ? 'online' : 'offline';
		});

		res.json({ statuses });
	} catch (err) {
		console.error('getOnlineStatuses error:', err);
		res.status(500).json({ error: 'Failed to fetch online statuses' });
	}
}
