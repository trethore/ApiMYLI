import type { PrismaClient } from "@prisma/generated/prisma/client";
import type Redis from "ioredis";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import { createRedisJwtAuthTokenService } from "@/infrastructure/auth";
import { argon2PasswordHasher } from "@/infrastructure/password-hasher";
import { createPrismaAccountRepository } from "@/infrastructure/prisma-account-repository";

export type AppServices = {
  accountRepository: AccountRepository;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

export const createAppServices = (prisma: PrismaClient, redis: Redis): AppServices => ({
  accountRepository: createPrismaAccountRepository(prisma),
  passwordHasher: argon2PasswordHasher,
  authTokenService: createRedisJwtAuthTokenService(redis),
});
