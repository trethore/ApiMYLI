import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";
import { toTrack, trackInclude } from "@/infrastructure/prisma-music-mappers";

type DbClient = PrismaClient | Prisma.TransactionClient;

const readTrack = async (
  dbClient: DbClient,
  trackId: string,
  currentAccountId: string,
): Promise<Track | null> => {
  const track = await dbClient.track.findUnique({
    where: { trackId },
    include: trackInclude(currentAccountId),
  });

  return track ? toTrack(track) : null;
};

const toBigInt = (value: bigint | null | undefined): bigint => {
  return value ?? BigInt(0);
};

export const createPrismaTrackLibraryRepository = (
  prisma: PrismaClient,
): TrackLibraryRepository => ({
  likeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      const track = await transaction.track.findUnique({
        where: { trackId },
        select: { trackId: true, trackFavorites: true },
      });

      if (!track) {
        return null;
      }

      const existingLike = await transaction.trackAccountLike.findFirst({
        where: { trackId, accountId },
      });

      if (!existingLike) {
        await transaction.trackAccountLike.create({
          data: {
            track: { connect: { trackId } },
            account: { connect: { accountId } },
          },
        });

        await transaction.track.update({
          where: { trackId },
          data: {
            trackFavorites: toBigInt(track.trackFavorites) + BigInt(1),
          },
        });
      }

      return readTrack(transaction, trackId, accountId);
    });
  },
  unlikeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      const track = await transaction.track.findUnique({
        where: { trackId },
        select: { trackId: true, trackFavorites: true },
      });

      if (!track) {
        return null;
      }

      const existingLike = await transaction.trackAccountLike.findFirst({
        where: { trackId, accountId },
      });

      if (existingLike) {
        await transaction.trackAccountLike.delete({
          where: {
            trackId_accountId: {
              trackId,
              accountId,
            },
          },
        });

        const nextFavorites = toBigInt(track.trackFavorites) - BigInt(1);

        await transaction.track.update({
          where: { trackId },
          data: {
            trackFavorites: nextFavorites > BigInt(0) ? nextFavorites : BigInt(0),
          },
        });
      }

      return readTrack(transaction, trackId, accountId);
    });
  },
  listLikedTracks: async (accountId: string): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: {
        accountLikes: {
          some: { accountId },
        },
      },
      include: trackInclude(accountId),
      orderBy: [{ trackFavorites: "desc" }, { trackTitle: "asc" }],
    });

    return tracks.map(toTrack);
  },
  recordTrackListen: async (accountId: string, trackId: string): Promise<boolean> => {
    return prisma.$transaction(async (transaction) => {
      const track = await transaction.track.findUnique({
        where: { trackId },
        select: { trackId: true, trackListens: true },
      });

      if (!track) {
        return false;
      }

      const existingListen = await transaction.trackAccountListen.findFirst({
        where: { trackId, accountId },
      });

      if (existingListen) {
        await transaction.trackAccountListen.update({
          where: {
            trackId_accountId: {
              trackId,
              accountId,
            },
          },
          data: {
            count: (existingListen.count ?? 0) + 1,
            listenedAt: new Date(),
          },
        });
      } else {
        await transaction.trackAccountListen.create({
          data: {
            count: 1,
            listenedAt: new Date(),
            track: { connect: { trackId } },
            account: { connect: { accountId } },
          },
        });
      }

      await transaction.track.update({
        where: { trackId },
        data: {
          trackListens: toBigInt(track.trackListens) + BigInt(1),
        },
      });

      return true;
    });
  },
});
