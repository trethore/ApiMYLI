import type { PrismaClient } from "@prisma/generated/prisma/client";
import type Redis from "ioredis";
import type { PlaylistImageStoragePort } from "packages/application/src/ports/storage/playlist-image-storage-port";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";
import { createRedisJwtAuthTokenService } from "@/infrastructure/auth";
import { createPrismaArtistCatalogRepository } from "@/infrastructure/prisma-artist-catalog-repository";
import { argon2PasswordHasher } from "@/infrastructure/password-hasher";
import { createPrismaAccountRepository } from "@/infrastructure/prisma-account-repository";
import { createPrismaPinnedItemRepository } from "@/infrastructure/prisma-pinned-item-repository";
import { createPrismaPlaylistRepository } from "@/infrastructure/prisma-playlist-repository";
import { createPrismaTrackCatalogRepository } from "@/infrastructure/prisma-track-catalog-repository";
import { createPrismaTrackLibraryRepository } from "@/infrastructure/prisma-track-library-repository";
import { createLocalPlaylistImageStorage } from "@/infrastructure/local-playlist-image-storage";
import type { UploadConfig } from "@/main/upload-config";

export type AppServices = {
  accountRepository: AccountRepository;
  artistCatalogRepository: ArtistCatalogRepository;
  pinnedItemRepository: PinnedItemRepository;
  trackCatalogRepository: TrackCatalogRepository;
  trackLibraryRepository: TrackLibraryRepository;
  playlistRepository: PlaylistRepository;
  playlistImageStorage: PlaylistImageStoragePort;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

export const createAppServices = (
  prisma: PrismaClient,
  redis: Redis,
  uploadConfig: UploadConfig,
): AppServices => ({
  accountRepository: createPrismaAccountRepository(prisma),
  artistCatalogRepository: createPrismaArtistCatalogRepository(prisma),
  pinnedItemRepository: createPrismaPinnedItemRepository(prisma),
  trackCatalogRepository: createPrismaTrackCatalogRepository(prisma),
  trackLibraryRepository: createPrismaTrackLibraryRepository(prisma),
  playlistRepository: createPrismaPlaylistRepository(prisma),
  playlistImageStorage: createLocalPlaylistImageStorage(uploadConfig),
  passwordHasher: argon2PasswordHasher,
  authTokenService: createRedisJwtAuthTokenService(redis),
});
