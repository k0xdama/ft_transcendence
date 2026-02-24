import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../chat-service.js';
import { db } from '../src/config/db.js';
import { redisClient, redisSubscriber } from '../src/config/redis.js';