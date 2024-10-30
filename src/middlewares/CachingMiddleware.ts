/**
 * @file CachingMiddleware.ts
 * @description Middleware function for caching API responses using Redis.
 * Caches responses based on the request path and query parameters.
 */

import CacheUtil from '../utils/CacheUtil';

/**
 * Middleware function to handle caching for API requests.
 * Checks if cached data exists for the current request; if found, returns the cached response.
 * Otherwise, sets the cache after the response is sent.
 * @param {object} req      - The request object, containing path and query parameters.
 * @param {object} res      - The response object, used to send back responses.
 * @param {function} next   - The next middleware function in the pipeline.
 * @returns {Promise<void>} - Executes the middleware logic asynchronously.
 */
export const CachingMiddleware = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  // Generate a unique cache key based on the request path and query parameters.
  const cacheKey = `${req.path}-${JSON.stringify(req.query)}`;

  // Check if the data for this request is already cached.
  const cachedData = await CacheUtil.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  res.on('finish', () => {
    if (res.body) {
      CacheUtil.set(cacheKey, res.body);
    }
  });

  next();
};