import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`,
});

redisClient.on('error', (err) => console.warn('Redis client error', err));

redisClient.connect().then(() => {
  console.log('Connected to Redis');
}).catch((err) => {
  console.error('Failed to connect to Redis', err);
});

export default redisClient;