import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { PlaylistCreateInput, PlaylistUpdateInput } from "@prisma/generated/prisma/models";
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
    const createData: PlaylistCreateInput = {
      playlistName: data.name,
      playlistDescription: data.description,
      playlistImagePath: data.imagePath,
      playlistAccounts: {
        create: {
          account: {
            connect: { accountId },
          },
        },
      },
    };

    const createdPlaylist = await prisma.playlist.create({
      data: createData,
      select: {
        playlistId: true,
      },
    });

    const playlist = await readPlaylist(prisma, createdPlaylist.playlistId, accountId);

    if (!playlist) {
      throw new Error("Failed to load created playlist");
    }

    return playlist;
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

    const updateData: PlaylistUpdateInput = {
      playlistName: data.name === undefined ? undefined : data.name,
      playlistDescription: data.description === undefined ? undefined : data.description,
      playlistImagePath: data.imagePath === undefined ? undefined : data.imagePath,
    };

    await prisma.playlist.update({
      where: { playlistId },
      data: updateData,
    });

    return readPlaylist(prisma, playlistId, accountId);
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
  searchPlaylists: async (query: string, currentAccountId?: string | null, limit = 10): Promise<Playlist[]> => {
    const playlists = await prisma.playlist.findMany({
      where: {
        playlistName: { contains: query, mode: "insensitive" },
      },
      include: playlistInclude(currentAccountId),
      take: limit,
    });
    return playlists.map((playlist) => toPlaylist(playlist, currentAccountId));
  },
});
