/**
 * Redis Configuration for Queue System
 */

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

export const redisUrl = process.env.REDIS_URL || `redis://${redisConfig.host}:${redisConfig.port}`;
