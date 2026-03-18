import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { TrackListenHistoryItem } from "packages/domain/src/entities/track-listen-history-item";
import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";
import { toTrack, trackInclude } from "@/infrastructure/prisma-music-mappers";

type DbClient = PrismaClient | Prisma.TransactionClient;
type TrackFeedback = "like" | "dislike";

const trackIdSelect = {
  trackId: true,
} satisfies Prisma.TrackSelect;

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

const listenHistoryItemInclude = (currentAccountId: string) =>
  ({
    track: {
      include: trackInclude(currentAccountId),
    },
  }) satisfies Prisma.TrackListenHistoryItemInclude;

type PrismaTrackListenHistoryItemWithRelations = Prisma.TrackListenHistoryItemGetPayload<{
  include: ReturnType<typeof listenHistoryItemInclude>;
}>;

const toTrackListenHistoryItem = (
  historyItem: PrismaTrackListenHistoryItemWithRelations,
): TrackListenHistoryItem => ({
  listenHistoryItemId: historyItem.listenHistoryItemId,
  listenedAt: historyItem.listenedAt,
  track: toTrack(historyItem.track),
});

const toBigInt = (value: bigint | null | undefined): bigint => {
  return value ?? BigInt(0);
};

const trackExists = async (dbClient: DbClient, trackId: string): Promise<boolean> => {
  const track = await dbClient.track.findUnique({
    where: { trackId },
    select: trackIdSelect,
  });

  return track !== null;
};

const setTrackFeedback = async (
  dbClient: DbClient,
  accountId: string,
  trackId: string,
  feedback: TrackFeedback,
): Promise<void> => {
  if (feedback === "like") {
    await dbClient.trackAccountDislike.deleteMany({
      where: { trackId, accountId },
    });

    await dbClient.trackAccountLike.upsert({
      where: {
        trackId_accountId: {
          trackId,
          accountId,
        },
      },
      update: {},
      create: {
        track: { connect: { trackId } },
        account: { connect: { accountId } },
      },
    });

    return;
  }

  await dbClient.trackAccountLike.deleteMany({
    where: { trackId, accountId },
  });

  await dbClient.trackAccountDislike.upsert({
    where: {
      trackId_accountId: {
        trackId,
        accountId,
      },
    },
    update: {},
    create: {
      track: { connect: { trackId } },
      account: { connect: { accountId } },
    },
  });
};

const clearTrackFeedback = async (
  dbClient: DbClient,
  accountId: string,
  trackId: string,
  feedback: TrackFeedback,
): Promise<void> => {
  if (feedback === "like") {
    await dbClient.trackAccountLike.deleteMany({
      where: { trackId, accountId },
    });

    return;
  }

  await dbClient.trackAccountDislike.deleteMany({
    where: { trackId, accountId },
  });
};

export const createPrismaTrackLibraryRepository = (
  prisma: PrismaClient,
): TrackLibraryRepository => ({
  likeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      if (!(await trackExists(transaction, trackId))) {
        return null;
      }

      await setTrackFeedback(transaction, accountId, trackId, "like");

      return readTrack(transaction, trackId, accountId);
    });
  },
  unlikeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      if (!(await trackExists(transaction, trackId))) {
        return null;
      }

      await clearTrackFeedback(transaction, accountId, trackId, "like");

      return readTrack(transaction, trackId, accountId);
    });
  },
  dislikeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      if (!(await trackExists(transaction, trackId))) {
        return null;
      }

      await setTrackFeedback(transaction, accountId, trackId, "dislike");

      return readTrack(transaction, trackId, accountId);
    });
  },
  undislikeTrack: async (accountId: string, trackId: string): Promise<Track | null> => {
    return prisma.$transaction(async (transaction) => {
      if (!(await trackExists(transaction, trackId))) {
        return null;
      }

      await clearTrackFeedback(transaction, accountId, trackId, "dislike");

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
  listDislikedTracks: async (accountId: string): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: {
        accountDislikes: {
          some: { accountId },
        },
      },
      include: trackInclude(accountId),
      orderBy: [{ trackFavorites: "desc" }, { trackTitle: "asc" }],
    });

    return tracks.map(toTrack);
  },
  listTrackListenHistory: async (
    accountId: string,
    limit = 50,
  ): Promise<TrackListenHistoryItem[]> => {
    const historyItems = await prisma.trackListenHistoryItem.findMany({
      where: { accountId },
      include: listenHistoryItemInclude(accountId),
      orderBy: [{ listenedAt: "desc" }, { listenHistoryItemId: "desc" }],
      take: limit,
    });

    return historyItems.map(toTrackListenHistoryItem);
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

      const listenedAt = new Date();

      await transaction.trackListenHistoryItem.create({
        data: {
          listenedAt,
          track: { connect: { trackId } },
          account: { connect: { accountId } },
        },
      });

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
            listenedAt,
          },
        });
      } else {
        await transaction.trackAccountListen.create({
          data: {
            count: 1,
            listenedAt,
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
