import CacheUtil from "../utils/CacheUtil";

export const CachingMiddleware = async (req: any, res: any, next: any) => {
  const cacheKey = `${req.path}-${JSON.stringify(req.query)}`;
  const cachedData = await CacheUtil.get(cacheKey);
  if (cachedData) return res.json(cachedData);

  res.on("finish", () => {
    CacheUtil.set(cacheKey, res.body);
  });
  next();
};
