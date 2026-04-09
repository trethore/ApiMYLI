import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Blindtest } from "packages/domain/src/entities/blindtest";
import { blindtestInclude, toBlindtest } from "@/infrastructure/prisma-music-mappers";
import { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";
import { CreateBlindtestInput } from "@/presentation/schema";
import { UpdateBlindtestInput } from "packages/application/src/use-cases/blindtest/update-blindtest";

type DbClient = PrismaClient | Prisma.TransactionClient;

const hasBlindtestAccess = async (
  dbClient: DbClient,
  blindtestId: string,
  accountId: string,
): Promise<boolean> => {
  const blindtest = await dbClient.blindtest.findFirst({
    where: {
      blindtestId,
      accountBlindtests: {
        some: { accountId },
      },
    },
    select: { blindtestId: true },
  });

  return blindtest !== null;
};

const readBlindtest = async (
  dbClient: DbClient,
  blindtestId: string,
  currentAccountId?: string | null,
): Promise<Blindtest | null> => {
  const blindtest = await dbClient.blindtest.findUnique({
    where: { blindtestId },
    include: blindtestInclude(currentAccountId),
  });

  return blindtest ? toBlindtest(blindtest, currentAccountId) : null;
};

export const createPrismaBlindtestRepository = (prisma: PrismaClient): BlindtestRepository => ({
  findById: async (
    blindtestId: string,
    currentAccountId?: string | null,
  ): Promise<Blindtest | null> => {
    return readBlindtest(prisma, blindtestId, currentAccountId);
  },
  listByAccountId: async (accountId: string): Promise<Blindtest[]> => {
    const blindtests = await prisma.blindtest.findMany({
      where: {
        accountBlindtests: {
          some: { accountId },
        },
      },
      include: blindtestInclude(accountId),
      orderBy: {
        blindtestName: "asc",
      },
    });

    return blindtests.map((blindtest) => toBlindtest(blindtest, accountId));
  },
  create: async (accountId: string, data: CreateBlindtestInput): Promise<Blindtest> => {
    const blindtest = await prisma.blindtest.create({
      data: {
        blindtestName: data.name,
        blindtestLength: data.length,
        blindtestDifficulty: data.difficulty,
        blindtestInstrumental: data.instrumental,
        blindtestYearBegin: data.yearBegin,
        blindtestYearEnd: data.yearEnd,

        // relations
        artistBlindtests: {
          create: data.artistIds?.map((id) => ({
            artist: {
              connect: { artistId: id }
            }
          }))
        },
        blindtestCompulsoryTracks: {
          create: data.compulsoryTrackIds?.map((id) => ({
            track: {
              connect: { trackId: id }
            }
          }))
        },
        blindtestGenres: {
          create: data.genreIds?.map((id) => ({
            genre: {
              connect: { genreId: id },
            },
          })),
        },
        accountBlindtests: {
          create: {
            account: {
              connect: { accountId },
            },
          },
        },
      },
      include: blindtestInclude(accountId),
    });

    return toBlindtest(blindtest, accountId);
  },
  update: async (
    accountId: string,
    blindtestId: string,
    data: UpdateBlindtestInput,
  ): Promise<Blindtest | null> => {
    const canEdit = await hasBlindtestAccess(prisma, blindtestId, accountId);

    if (!canEdit) {
      return null;
    }

    const blindtest = await prisma.blindtest.update({
      where: { blindtestId },
      data: {
        // direct attrs
        ...(data.name != null && { blindtestName: data.name }),
        ...(data.difficulty != null && { blindtestDifficulty: data.difficulty }),
        ...(data.length != null && { blindtestLength: data.length }),
        blindtestYearBegin: data.yearBegin,
        blindtestYearEnd: data.yearEnd,
        blindtestInstrumental: data.instrumental,

        // relations
        blindtestCompulsoryTracks: {
          deleteMany: {},
          createMany: {
            data: (data.compulsoryTrackIds ?? []).map((trackId) => ({
              trackId,
            })),
          },
        },
        artistBlindtests: {
          deleteMany: {},
          createMany: {
            data: (data.artistIds ?? []).map((artistId) => ({
              artistId,
            })),
          },
        },
        blindtestGenres: {
          deleteMany: {},
          createMany: {
            data: (data.genreIds ?? []).map((genreId) => ({
              genreId,
            })),
          },
        },

      },
      include: blindtestInclude(accountId),
    });

    return toBlindtest(blindtest, accountId);
  },
  delete: async (accountId: string, blindtestId: string): Promise<boolean> => {
    const canEdit = await hasBlindtestAccess(prisma, blindtestId, accountId);

    if (!canEdit) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.accountBlindtest.deleteMany({ where: { blindtestId } });
      await transaction.artistBlindtest.deleteMany({ where: { blindtestId } });
      await transaction.blindtestCompulsoryTrack.deleteMany({ where: { blindtestId } });
      await transaction.blindtestGenre.deleteMany({ where: { blindtestId } });
      await transaction.blindtestTrack.deleteMany({ where: { blindtestId } });
      await transaction.blindtest.delete({ where: { blindtestId } });
    });

    return true;
  },
  addCompulsoryTrack: async (
    accountId: string,
    blindtestId: string,
    trackId: string,
  ): Promise<Blindtest | null> => {
    return prisma.$transaction(async (transaction) => {
      const canEdit = await hasBlindtestAccess(transaction, blindtestId, accountId);

      if (!canEdit) {
        return null;
      }

      const track = await transaction.track.findUnique({
        where: { trackId },
        select: { trackId: true },
      });

      if (!track) {
        return null;
      }

      // max length reached ?
      const blindtest = await transaction.blindtest.findUnique({
        where: { blindtestId },
        select: {
          blindtestId: true, blindtestLength: true, blindtestTracks: true, blindtestCompulsoryTracks: true
        },
      });
      if (blindtest &&
        (blindtest.blindtestTracks?.length + blindtest?.blindtestCompulsoryTracks?.length >= blindtest.blindtestLength)
      ) {
        return null;
      }

      const existingBlintestTrack = await transaction.blindtestCompulsoryTrack.findFirst({
        where: { blindtestId, trackId },
      });

      if (!existingBlintestTrack) {
        await transaction.blindtestCompulsoryTrack.create({
          data: {
            blindtest: { connect: { blindtestId } },
            track: { connect: { trackId } },
          },
        });
      }

      return readBlindtest(transaction, blindtestId, accountId);
    });
  },
  removeCompulsoryTrack: async (
    accountId: string,
    blindtestId: string,
    trackId: string,
  ): Promise<Blindtest | null> => {
    return prisma.$transaction(async (transaction) => {
      const canEdit = await hasBlindtestAccess(transaction, blindtestId, accountId);

      if (!canEdit) {
        return null;
      }

      const existingBlindtestTrack = await transaction.blindtestCompulsoryTrack.findFirst({
        where: { blindtestId, trackId },
      });

      if (existingBlindtestTrack) {
        await transaction.blindtestCompulsoryTrack.delete({
          where: {
            blindtestId_trackId: {
              blindtestId,
              trackId,
            },
          },
        });
      }

      return readBlindtest(transaction, blindtestId, accountId);
    });
  },
  addTrack: async (
    accountId: string,
    blindtestId: string,
    trackId: string,
  ): Promise<Blindtest | null> => {
    return prisma.$transaction(async (transaction) => {
      // is owner ?
      const canEdit = await hasBlindtestAccess(transaction, blindtestId, accountId);
      if (!canEdit) {
        return null;
      }

      // track exists ?
      const track = await transaction.track.findUnique({
        where: { trackId },
        select: { trackId: true },
      });
      if (!track) {
        return null;
      }

      // max length reached ?
      const blindtest = await transaction.blindtest.findUnique({
        where: { blindtestId },
        select: {
          blindtestId: true, blindtestLength: true, blindtestTracks: true, blindtestCompulsoryTracks: true
        },
      });
      if (blindtest &&
        (blindtest.blindtestTracks?.length + blindtest?.blindtestCompulsoryTracks?.length >= blindtest.blindtestLength)
      ) {
        return null;
      }

      // alrdy added ?
      const existingBlintestTrack = await transaction.blindtestTrack.findFirst({
        where: { blindtestId, trackId },
      });
      if (!existingBlintestTrack) {
        await transaction.blindtestTrack.create({
          data: {
            blindtest: { connect: { blindtestId } },
            track: { connect: { trackId } },
          },
        });
      }

      return readBlindtest(transaction, blindtestId, accountId);
    });
  },
  removeTrack: async (
    accountId: string,
    blindtestId: string,
    trackId: string,
  ): Promise<Blindtest | null> => {
    return prisma.$transaction(async (transaction) => {
      const canEdit = await hasBlindtestAccess(transaction, blindtestId, accountId);

      if (!canEdit) {
        return null;
      }

      const existingBlindtestTrack = await transaction.blindtestTrack.findFirst({
        where: { blindtestId, trackId },
      });

      if (existingBlindtestTrack) {
        await transaction.blindtestTrack.delete({
          where: {
            blindtestId_trackId: {
              blindtestId,
              trackId,
            },
          },
        });
      }

      return readBlindtest(transaction, blindtestId, accountId);
    });
  },
});
