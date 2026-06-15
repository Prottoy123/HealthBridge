import { Redis } from "ioredis";
import { ApiError } from "../utils/ApiError.js";

let redisInstance = null;

export const connectRedis = () => {
  if (redisInstance) {
    return redisInstance;
  }

  try {
    const redisUrl = process.env.UPSTASH_REDIS_URL;

    if (!redisUrl) {
      throw new ApiError(500, "Redis URL is missing in environment variables");
    }

    redisInstance = new Redis(redisUrl, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisInstance.on("connect", () => {
      console.log("🟢 Redis Connected Successfully (Upstash)");
    });

    redisInstance.on("error", (error) => {
      console.error("🔴 Redis Connection Error:", error);
    });

    redisInstance.on("reconnecting", () => {
      console.log("🟡 Redis Reconnecting...");
    });

    return redisInstance;
  } catch (error) {
    console.error("🔴 Failed to initialize Redis:", error);
    process.exit(1); 
  }
};

// to get the access of redis from any controller or service, we can use this function to get the instance of redis

export const getRedis = () => {
  if (!redisInstance) {
    throw new ApiError(500, "Redis has not been initialized yet!");
  }
  return redisInstance;
};

// to avoid memory leaks when server is terminated, gracefully close the Redis connection
process.on("SIGINT", async () => {
  if (redisInstance) {
    await redisInstance.quit();
    console.log("🔴 Redis Connection Closed safely due to app termination");
    process.exit(0);
  }
});
