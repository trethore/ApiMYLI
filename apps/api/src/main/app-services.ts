import type { PrismaClient } from "@prisma/generated/prisma/client";
import type Redis from "ioredis";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";
import { createRedisJwtAuthTokenService } from "@/infrastructure/auth";
import { argon2PasswordHasher } from "@/infrastructure/password-hasher";
import { createPrismaAccountRepository } from "@/infrastructure/prisma-account-repository";
import { createPrismaPlaylistRepository } from "@/infrastructure/prisma-playlist-repository";
import { createPrismaTrackCatalogRepository } from "@/infrastructure/prisma-track-catalog-repository";
import { createPrismaTrackLibraryRepository } from "@/infrastructure/prisma-track-library-repository";

export type AppServices = {
  accountRepository: AccountRepository;
  trackCatalogRepository: TrackCatalogRepository;
  trackLibraryRepository: TrackLibraryRepository;
  playlistRepository: PlaylistRepository;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

export const createAppServices = (prisma: PrismaClient, redis: Redis): AppServices => ({
  accountRepository: createPrismaAccountRepository(prisma),
  trackCatalogRepository: createPrismaTrackCatalogRepository(prisma),
  trackLibraryRepository: createPrismaTrackLibraryRepository(prisma),
  playlistRepository: createPrismaPlaylistRepository(prisma),
  passwordHasher: argon2PasswordHasher,
  authTokenService: createRedisJwtAuthTokenService(redis),
});
