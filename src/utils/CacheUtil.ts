/**
 * @file CacheUtil.ts
 * @description Utility class for handling caching operations using Redis.
 * Provides methods for setting, getting, and deleting cached data with optional Time to Live (TTL).
 */

import Redis from 'ioredis';

/**
 * A utility class for handling caching operations with Redis.
 * @class CacheUtil
 */
class CacheUtil {
  private redisClient: Redis;

  /**
   * Creates an instance of CacheUtil and initializes a Redis client connection.
   * @constructor
   */
  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  /**
   * Sets a cache entry with a specified key, value, and optional TTL (Time to Live).
   * @param {string} key        - The key under which the value will be stored in Redis.
   * @param {any} value         - The value to be cached. It will be stringified before storing.
   * @param {number} [ttl=3600] - The time to live in seconds for the cache entry. Default is 3600 seconds (1 hour).
   * @returns {Promise<void>}
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redisClient.set(key, data, 'EX', ttl);
    } catch (error: any) {
      console.error(`Cache Set Error: ${error.message}`);
    }
  }

  /**
   * Retrieves a cached value by its key and parses it to the specified type.
   * @template T
   * @param {string} key - The key of the cache entry to retrieve.
   * @returns {Promise<T | null>} - Returns the parsed value if found, otherwise returns null.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      console.error(`Cache Get Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Deletes a cache entry by its key.
   * @param {string} key - The key of the cache entry to delete.
   * @returns {Promise<void>}
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error: any) {
      console.error(`Cache Delete Error: ${error.message}`);
    }
  }
}

export default new CacheUtil();