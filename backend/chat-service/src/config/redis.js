import fs from 'fs';
import { createClient } from 'redis';

const redisPassword = fs.readFileSync('/run/secrets/redis_passwd', 'utf8').trim();

const config = {
	socket: { host: 'redis', port: 6379 },
	password: redisPassword
};

// main client (publish, get, set)
const client = createClient(config);

// subscriber client (pub and sub should be separed)
const subscriber = client.duplicate();

client.on('error', (err) => console.error('Redis Client:', err));
subscriber.on('error', (err) => console.error('Redis Subscriber:', err));

await client.connect();
await subscriber.connect();

console.log('Redis connected!');

// Lobby membership state, populated via Redis pub/sub from lobby-service
// lobbyId --> Set<userId>
export const lobbyMembers = new Map();

export { client as redisClient, subscriber as redisSubscriber };