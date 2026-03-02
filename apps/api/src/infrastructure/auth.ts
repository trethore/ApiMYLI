import { SignJWT, jwtVerify } from "jose";
import type Redis from "ioredis";

const getJwtSecret = (): Uint8Array => {
  const secret = Bun.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(secret);
};

export const createAuthToken = async (accountId: string, redis: Redis): Promise<string> => {
  const secret = getJwtSecret();
  const jti = crypto.randomUUID();

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(accountId)
    .setJti(jti)
    .setExpirationTime("7d")
    .sign(secret);

  await redis.set(`session:${jti}`, accountId, "EX", 60 * 60 * 24 * 7);

  return token;
};

export const verifyAuthToken = async (
  token: string,
  redis: Redis
): Promise<string | null> => {
  const secret = getJwtSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    const accountId = payload.sub;
    const jti = payload.jti;

    if (!accountId || !jti) {
      return null;
    }

    const sessionAccountId = await redis.get(`session:${jti}`);

    if (sessionAccountId !== accountId) {
      return null;
    }

    return accountId;
  } catch {
    return null;
  }
};

export const revokeAuthToken = async (token: string, redis: Redis): Promise<boolean> => {
  const secret = getJwtSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    const jti = payload.jti;

    if (!jti) {
      return false;
    }

    const deleted = await redis.del(`session:${jti}`);

    return deleted > 0;
  } catch {
    return false;
  }
};
