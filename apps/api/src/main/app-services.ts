import type { PrismaClient } from "@prisma/generated/prisma/client";
import type Redis from "ioredis";
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
import { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";
import { createPrismaBlindtestRepository } from "@/infrastructure/prisma-blindtest-repository";
import { GenreRepository } from "packages/domain/src/repositories/genre-repository";
import { createPrismaGenreRepository } from "@/infrastructure/prisma-genre-repository";

export type AppServices = {
  accountRepository: AccountRepository;
  artistCatalogRepository: ArtistCatalogRepository;
  pinnedItemRepository: PinnedItemRepository;
  trackCatalogRepository: TrackCatalogRepository;
  trackLibraryRepository: TrackLibraryRepository;
  playlistRepository: PlaylistRepository;
  blindtestRepository: BlindtestRepository;
  genreRepository: GenreRepository;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

export const createAppServices = (prisma: PrismaClient, redis: Redis): AppServices => ({
  accountRepository: createPrismaAccountRepository(prisma),
  artistCatalogRepository: createPrismaArtistCatalogRepository(prisma),
  pinnedItemRepository: createPrismaPinnedItemRepository(prisma),
  trackCatalogRepository: createPrismaTrackCatalogRepository(prisma),
  trackLibraryRepository: createPrismaTrackLibraryRepository(prisma),
  playlistRepository: createPrismaPlaylistRepository(prisma),
  genreRepository: createPrismaGenreRepository(prisma),
  blindtestRepository: createPrismaBlindtestRepository(prisma),
  passwordHasher: argon2PasswordHasher,
  authTokenService: createRedisJwtAuthTokenService(redis),
});
