import Redis from "ioredis";

const redisUrl = Bun.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 10) return null;
    // Exponential backoff capped at 2s to avoid thundering herd
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});
