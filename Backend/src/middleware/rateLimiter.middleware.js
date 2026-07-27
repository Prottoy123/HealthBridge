import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { getRedis } from "../config/redis.config.js";

export const rateLimiter = (keyPrefix, limit, windowTime) => {
  return asyncHandler(async (req, res, next) => {
    const redisClient = getRedis();

    const key = `${keyPrefix}:${req.user._id}`;

    const requestCount = await redisClient.incr(key);

    if (requestCount === 1) {
      await redisClient.expire(key, windowTime);
    }

    if (requestCount > limit) {
      throw new ApiError(
        429,
        `Rate limit exceeded for ${keyPrefix}. Please try again later.`
      );
    }

    next();
  });
};
