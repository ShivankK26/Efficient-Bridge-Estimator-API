/**
 * @file index.ts
 * @description Contains configuration constants for the application, including API URL and cache settings.
 * These configurations use environment variables, with default values as fallbacks.
 */

export const CONFIG = {
  /**
   * The base URL for the external API.
   * Defaults to 'https://api.socket.tech/v2' if the environment variable `API_URL` is not set.
   * @type {string}
   */
  API_URL: process.env.API_URL || 'https://api.socket.tech/v2',

  /**
   * Cache Time-to-Live (TTL) in seconds.
   * Defines how long cached data should be stored.
   * Defaults to 3600 seconds (1 hour) if the environment variable `CACHE_TTL` is not set.
   * @type {number}
   */
  CACHE_TTL: Number(process.env.CACHE_TTL) || 3600,
};