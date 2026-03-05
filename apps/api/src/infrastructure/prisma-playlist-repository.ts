import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Playlist } from "packages/domain/src/entities/playlist";
import type {
  CreatePlaylistData,
  PlaylistRepository,
  UpdatePlaylistData,
} from "packages/domain/src/repositories/playlist-repository";
import { playlistInclude, toPlaylist } from "@/infrastructure/prisma-music-mappers";

type DbClient = PrismaClient | Prisma.TransactionClient;

const hasPlaylistAccess = async (
  dbClient: DbClient,
  playlistId: string,
  accountId: string,
): Promise<boolean> => {
  const playlist = await dbClient.playlist.findFirst({
    where: {
      playlistId,
      playlistAccounts: {
        some: { accountId },
      },
    },
    select: { playlistId: true },
  });

  return playlist !== null;
};

const readPlaylist = async (
  dbClient: DbClient,
  playlistId: string,
  currentAccountId?: string | null,
): Promise<Playlist | null> => {
  const playlist = await dbClient.playlist.findUnique({
    where: { playlistId },
    include: playlistInclude(currentAccountId),
  });

  return playlist ? toPlaylist(playlist, currentAccountId) : null;
};

export const createPrismaPlaylistRepository = (prisma: PrismaClient): PlaylistRepository => ({
  findById: async (
    playlistId: string,
    currentAccountId?: string | null,
  ): Promise<Playlist | null> => {
    return readPlaylist(prisma, playlistId, currentAccountId);
  },
  listByAccountId: async (accountId: string): Promise<Playlist[]> => {
    const playlists = await prisma.playlist.findMany({
      where: {
        playlistAccounts: {
          some: { accountId },
        },
      },
      include: playlistInclude(accountId),
      orderBy: {
        playlistName: "asc",
      },
    });

    return playlists.map((playlist) => toPlaylist(playlist, accountId));
  },
  create: async (accountId: string, data: CreatePlaylistData): Promise<Playlist> => {
    const playlist = await prisma.playlist.create({
      data: {
        playlistName: data.name,
        playlistAccounts: {
          create: {
            account: {
              connect: { accountId },
            },
          },
        },
      },
      include: playlistInclude(accountId),
    });

    return toPlaylist(playlist, accountId);
  },
  update: async (
    accountId: string,
    playlistId: string,
    data: UpdatePlaylistData,
  ): Promise<Playlist | null> => {
    const canEdit = await hasPlaylistAccess(prisma, playlistId, accountId);

    if (!canEdit) {
      return null;
    }

    const playlist = await prisma.playlist.update({
      where: { playlistId },
      data: {
        playlistName: data.name === undefined ? undefined : data.name,
      },
      include: playlistInclude(accountId),
    });

    return toPlaylist(playlist, accountId);
  },
  delete: async (accountId: string, playlistId: string): Promise<boolean> => {
    const canEdit = await hasPlaylistAccess(prisma, playlistId, accountId);

    if (!canEdit) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.playlistTrack.deleteMany({ where: { playlistId } });
      await transaction.playlistAccount.deleteMany({ where: { playlistId } });
      await transaction.playlist.delete({ where: { playlistId } });
    });

    return true;
  },
  addTrack: async (
    accountId: string,
    playlistId: string,
    trackId: string,
  ): Promise<Playlist | null> => {
    return prisma.$transaction(async (transaction) => {
      const canEdit = await hasPlaylistAccess(transaction, playlistId, accountId);

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

      const existingPlaylistTrack = await transaction.playlistTrack.findFirst({
        where: { playlistId, trackId },
      });

      if (!existingPlaylistTrack) {
        await transaction.playlistTrack.create({
          data: {
            playlist: { connect: { playlistId } },
            track: { connect: { trackId } },
          },
        });
      }

      return readPlaylist(transaction, playlistId, accountId);
    });
  },
  removeTrack: async (
    accountId: string,
    playlistId: string,
    trackId: string,
  ): Promise<Playlist | null> => {
    return prisma.$transaction(async (transaction) => {
      const canEdit = await hasPlaylistAccess(transaction, playlistId, accountId);

      if (!canEdit) {
        return null;
      }

      const existingPlaylistTrack = await transaction.playlistTrack.findFirst({
        where: { playlistId, trackId },
      });

      if (existingPlaylistTrack) {
        await transaction.playlistTrack.delete({
          where: {
            playlistId_trackId: {
              playlistId,
              trackId,
            },
          },
        });
      }

      return readPlaylist(transaction, playlistId, accountId);
    });
  },
});
