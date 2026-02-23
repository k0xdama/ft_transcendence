import { createClient } from 'redis';
import { fs } from 'fs';

const redisPassword = fs.readFileSync('/run/secrets/redis_passwd', 'utf8').trim();
