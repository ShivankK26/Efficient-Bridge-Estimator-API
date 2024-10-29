import Redis from "ioredis";

class CacheUtil {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  // Method to set cache data with a TTL (Time to Live)
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redisClient.set(key, data, "EX", ttl);
    } catch (error: any) {
      console.error(`Cache Set Error: ${error.message}`);
    }
  }

  // Method to get cache data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error: any) {
      console.error(`Cache Get Error: ${error.message}`);
      return null;
    }
  }

  // Method to delete cache data
  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error: any) {
      console.error(`Cache Delete Error: ${error.message}`);
    }
  }
}

export default new CacheUtil();
