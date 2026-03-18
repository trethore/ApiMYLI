import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { ArtistSummary } from "packages/domain/src/entities/track";
import type { PinnedItem } from "packages/domain/src/entities/pinned-item";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";
import {
  albumInclude,
  playlistSummaryInclude,
  toAlbum,
  toPlaylistSummary,
  toTrack,
  trackInclude,
} from "@/infrastructure/prisma-music-mappers";

type DbClient = PrismaClient | Prisma.TransactionClient;

const pinnedItemInclude = (currentAccountId: string) =>
  ({
    track: {
      include: trackInclude(currentAccountId),
    },
    album: {
      include: albumInclude(),
    },
    artist: {
      include: {
        account: true,
      },
    },
    playlist: {
      include: playlistSummaryInclude(),
    },
  }) satisfies Prisma.AccountPinnedItemInclude;

type PrismaPinnedItemWithRelations = Prisma.AccountPinnedItemGetPayload<{
  include: ReturnType<typeof pinnedItemInclude>;
}>;

const toArtistSummary = (artist: {
  artistId: string;
  artistImageFile: string | null;
  account: {
    name: string | null;
    login: string | null;
  };
}): ArtistSummary => ({
  artistId: artist.artistId,
  name: artist.account.name ?? artist.account.login,
  imageUrl: artist.artistImageFile,
});

const toPinnedItem = (
  pinnedItem: PrismaPinnedItemWithRelations,
  currentAccountId: string,
): PinnedItem => ({
  slot: pinnedItem.slot,
  itemType: pinnedItem.itemType,
  pinnedAt: pinnedItem.pinnedAt,
  track: pinnedItem.track ? toTrack(pinnedItem.track) : null,
  album: pinnedItem.album ? toAlbum(pinnedItem.album) : null,
  artist: pinnedItem.artist ? toArtistSummary(pinnedItem.artist) : null,
  playlist: pinnedItem.playlist ? toPlaylistSummary(pinnedItem.playlist, currentAccountId) : null,
});

const readPinnedItem = async (
  dbClient: DbClient,
  accountId: string,
  slot: number,
): Promise<PinnedItem | null> => {
  const pinnedItem = await dbClient.accountPinnedItem.findUnique({
    where: {
      accountId_slot: {
        accountId,
        slot,
      },
    },
    include: pinnedItemInclude(accountId),
  });

  return pinnedItem ? toPinnedItem(pinnedItem, accountId) : null;
};

const pinTrackAtSlot = async (
  dbClient: DbClient,
  accountId: string,
  slot: number,
  trackId: string,
): Promise<PinnedItem | null> => {
  const track = await dbClient.track.findUnique({
    where: { trackId },
    select: { trackId: true },
  });

  if (!track) {
    return null;
  }

  await dbClient.accountPinnedItem.upsert({
    where: {
      accountId_slot: {
        accountId,
        slot,
      },
    },
    create: {
      slot,
      itemType: "TRACK",
      account: {
        connect: { accountId },
      },
      track: {
        connect: { trackId },
      },
    },
    update: {
      itemType: "TRACK",
      track: {
        connect: { trackId },
      },
      album: {
        disconnect: true,
      },
      artist: {
        disconnect: true,
      },
      playlist: {
        disconnect: true,
      },
    },
  });

  return readPinnedItem(dbClient, accountId, slot);
};

const pinAlbumAtSlot = async (
  dbClient: DbClient,
  accountId: string,
  slot: number,
  albumId: string,
): Promise<PinnedItem | null> => {
  const album = await dbClient.album.findUnique({
    where: { albumId },
    select: { albumId: true },
  });

  if (!album) {
    return null;
  }

  await dbClient.accountPinnedItem.upsert({
    where: {
      accountId_slot: {
        accountId,
        slot,
      },
    },
    create: {
      slot,
      itemType: "ALBUM",
      account: {
        connect: { accountId },
      },
      album: {
        connect: { albumId },
      },
    },
    update: {
      itemType: "ALBUM",
      track: {
        disconnect: true,
      },
      album: {
        connect: { albumId },
      },
      artist: {
        disconnect: true,
      },
      playlist: {
        disconnect: true,
      },
    },
  });

  return readPinnedItem(dbClient, accountId, slot);
};

const pinArtistAtSlot = async (
  dbClient: DbClient,
  accountId: string,
  slot: number,
  artistId: string,
): Promise<PinnedItem | null> => {
  const artist = await dbClient.artist.findUnique({
    where: { artistId },
    select: { artistId: true },
  });

  if (!artist) {
    return null;
  }

  await dbClient.accountPinnedItem.upsert({
    where: {
      accountId_slot: {
        accountId,
        slot,
      },
    },
    create: {
      slot,
      itemType: "ARTIST",
      account: {
        connect: { accountId },
      },
      artist: {
        connect: { artistId },
      },
    },
    update: {
      itemType: "ARTIST",
      track: {
        disconnect: true,
      },
      album: {
        disconnect: true,
      },
      artist: {
        connect: { artistId },
      },
      playlist: {
        disconnect: true,
      },
    },
  });

  return readPinnedItem(dbClient, accountId, slot);
};

const pinPlaylistAtSlot = async (
  dbClient: DbClient,
  accountId: string,
  slot: number,
  playlistId: string,
): Promise<PinnedItem | null> => {
  const playlist = await dbClient.playlist.findUnique({
    where: { playlistId },
    select: { playlistId: true },
  });

  if (!playlist) {
    return null;
  }

  await dbClient.accountPinnedItem.upsert({
    where: {
      accountId_slot: {
        accountId,
        slot,
      },
    },
    create: {
      slot,
      itemType: "PLAYLIST",
      account: {
        connect: { accountId },
      },
      playlist: {
        connect: { playlistId },
      },
    },
    update: {
      itemType: "PLAYLIST",
      track: {
        disconnect: true,
      },
      album: {
        disconnect: true,
      },
      artist: {
        disconnect: true,
      },
      playlist: {
        connect: { playlistId },
      },
    },
  });

  return readPinnedItem(dbClient, accountId, slot);
};

export const createPrismaPinnedItemRepository = (
  prisma: PrismaClient,
): PinnedItemRepository => ({
  listByAccountId: async (accountId: string): Promise<PinnedItem[]> => {
    const pinnedItems = await prisma.accountPinnedItem.findMany({
      where: { accountId },
      include: pinnedItemInclude(accountId),
      orderBy: {
        slot: "asc",
      },
    });

    return pinnedItems.map((pinnedItem) => toPinnedItem(pinnedItem, accountId));
  },
  pinTrack: async (accountId: string, slot: number, trackId: string): Promise<PinnedItem | null> => {
    return prisma.$transaction((transaction) => pinTrackAtSlot(transaction, accountId, slot, trackId));
  },
  pinAlbum: async (accountId: string, slot: number, albumId: string): Promise<PinnedItem | null> => {
    return prisma.$transaction((transaction) => pinAlbumAtSlot(transaction, accountId, slot, albumId));
  },
  pinArtist: async (
    accountId: string,
    slot: number,
    artistId: string,
  ): Promise<PinnedItem | null> => {
    return prisma.$transaction((transaction) => pinArtistAtSlot(transaction, accountId, slot, artistId));
  },
  pinPlaylist: async (
    accountId: string,
    slot: number,
    playlistId: string,
  ): Promise<PinnedItem | null> => {
    return prisma.$transaction((transaction) =>
      pinPlaylistAtSlot(transaction, accountId, slot, playlistId),
    );
  },
  unpin: async (accountId: string, slot: number): Promise<boolean> => {
    const deletedPinnedItem = await prisma.accountPinnedItem.deleteMany({
      where: {
        accountId,
        slot,
      },
    });

    return deletedPinnedItem.count > 0;
  },
});
