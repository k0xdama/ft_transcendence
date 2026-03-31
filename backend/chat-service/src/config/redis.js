import { createClient } from 'redis';
import fs from 'fs';

const redisPassword = fs.readFileSync('/run/secrets/redis_passwd', 'utf8').trim();

const config = {
	socket: {
		host: 'redis',
		port: 6379
	},
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

export { client as redisClient, subscriber as redisSubscriber };