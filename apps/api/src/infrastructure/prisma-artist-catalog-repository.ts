import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import { albumInclude, toAlbum } from "@/infrastructure/prisma-music-mappers";

type DbClient = PrismaClient | Prisma.TransactionClient;

type FavoriteArtistRow = {
  artist_id: string;
};

type FavoriteAlbumRow = {
  album_id: string;
};

const toNullableNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const toBigInt = (value: bigint | null | undefined): bigint => {
  return value ?? BigInt(0);
};

const parseImages = (value: string | null): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (Array.isArray(parsedValue)) {
      return parsedValue.filter((item): item is string => typeof item === "string");
    }

    if (typeof parsedValue === "string") {
      return [parsedValue];
    }
  } catch {
    return [value];
  }

  return [];
};

const getFavoritedArtistIds = async (
  dbClient: DbClient,
  accountId: string | null | undefined,
  artistIds: string[],
): Promise<Set<string>> => {
  if (!accountId || artistIds.length === 0) {
    return new Set<string>();
  }

  const rows = await dbClient.$queryRaw<FavoriteArtistRow[]>`
      SELECT artist_id
      FROM artist_account_favorite
      WHERE account_id = ${accountId}::uuid
        AND artist_id = ANY(${artistIds}::uuid[])
    `;

  return new Set(rows.map((row) => row.artist_id));
};

const getFavoritedAlbumIds = async (
  dbClient: DbClient,
  accountId: string | null | undefined,
  albumIds: string[],
): Promise<Set<string>> => {
  if (!accountId || albumIds.length === 0) {
    return new Set<string>();
  }

  const rows = await dbClient.$queryRaw<FavoriteAlbumRow[]>`
      SELECT album_id
      FROM album_account_favorite
      WHERE account_id = ${accountId}::uuid
        AND album_id = ANY(${albumIds}::uuid[])
    `;

  return new Set(rows.map((row) => row.album_id));
};

type PrismaArtistWithRelations = Prisma.ArtistGetPayload<{
  include: {
    account: true;
    artistTags: {
      include: {
        tag: true;
      };
    };
  };
}>;

const toArtist = (
  artist: PrismaArtistWithRelations,
  albumCount: number,
  trackCount: number,
  isFavorited: boolean,
): Artist => ({
  artistId: artist.artistId,
  name: artist.account.name ?? artist.account.login,
  imageUrl: artist.artistImageFile,
  images: parseImages(artist.artistImages),
  bio: artist.artistBio,
  members: artist.artistMembers,
  location: artist.artistLocation,
  latitude: artist.artistLatitude,
  longitude: artist.artistLongitude,
  activeYearBegin: artist.artistActiveYearBegin,
  activeYearEnd: artist.artistActiveYearEnd,
  favorites: toNullableNumber(artist.artistFavorites),
  comments: toNullableNumber(artist.artistComments),
  tags: artist.artistTags
    .map((artistTag) => artistTag.tag.tagName)
    .filter((tagName): tagName is string => Boolean(tagName))
    .sort((leftTag, rightTag) => leftTag.localeCompare(rightTag)),
  albumCount,
  trackCount,
  isFavorited,
});

const readArtist = async (
  dbClient: DbClient,
  artistId: string,
  currentAccountId: string | null | undefined,
): Promise<Artist | null> => {
  const artist = await dbClient.artist.findUnique({
    where: { artistId },
    include: {
      account: true,
      artistTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!artist) {
    return null;
  }

  const [albumCount, trackCount, favoritedArtistIds] = await Promise.all([
    dbClient.album.count({
      where: {
        albumArtists: {
          some: { artistId },
        },
      },
    }),
    dbClient.track.count({
      where: {
        OR: [
          { mainArtists: { some: { artistId } } },
          { featArtists: { some: { artistId } } },
        ],
      },
    }),
    getFavoritedArtistIds(dbClient, currentAccountId, [artistId]),
  ]);

  return toArtist(artist, albumCount, trackCount, favoritedArtistIds.has(artistId));
};

const readAlbum = async (
  dbClient: DbClient,
  albumId: string,
  currentAccountId: string | null | undefined,
): Promise<Album | null> => {
  const album = await dbClient.album.findUnique({
    where: { albumId },
    include: albumInclude(),
  });

  if (!album) {
    return null;
  }

  const favoritedAlbumIds = await getFavoritedAlbumIds(dbClient, currentAccountId, [albumId]);

  return toAlbum(album, favoritedAlbumIds.has(albumId));
};

export const createPrismaArtistCatalogRepository = (
  prisma: PrismaClient,
): ArtistCatalogRepository => ({
  findById: async (
    artistId: string,
    currentAccountId?: string | null,
  ): Promise<Artist | null> => {
    return readArtist(prisma, artistId, currentAccountId);
  },
  listAlbumsByArtistId: async (
    artistId: string,
    currentAccountId?: string | null,
  ): Promise<Album[]> => {
    const albums = await prisma.album.findMany({
      where: {
        albumArtists: {
          some: { artistId },
        },
      },
      include: albumInclude(),
      orderBy: [
        { albumDateReleased: "desc" },
        { albumTitle: "asc" },
      ],
    });

    const favoritedAlbumIds = await getFavoritedAlbumIds(
      prisma,
      currentAccountId,
      albums.map((album) => album.albumId),
    );

    return albums.map((album) => toAlbum(album, favoritedAlbumIds.has(album.albumId)));
  },
  searchArtists: async (
    query: string,
    currentAccountId?: string | null,
    limit = 10,
  ): Promise<Artist[]> => {
    const artists = await prisma.artist.findMany({
      where: {
        OR: [
          { account: { name: { contains: query, mode: "insensitive" } } },
          { account: { login: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        account: true,
        artistTags: {
          include: {
            tag: true,
          },
        },
      },
      take: limit,
      orderBy: {
        artistFavorites: "desc",
      },
    });

    const favoritedArtistIds = await getFavoritedArtistIds(
      prisma,
      currentAccountId,
      artists.map((artist) => artist.artistId),
    );

    return Promise.all(
      artists.map(async (artist) => {
        const [albumCount, trackCount] = await Promise.all([
          prisma.album.count({
            where: {
              albumArtists: {
                some: { artistId: artist.artistId },
              },
            },
          }),
          prisma.track.count({
            where: {
              OR: [
                { mainArtists: { some: { artistId: artist.artistId } } },
                { featArtists: { some: { artistId: artist.artistId } } },
              ],
            },
          }),
        ]);

        return toArtist(
          artist,
          albumCount,
          trackCount,
          favoritedArtistIds.has(artist.artistId),
        );
      })
    );
  },
  searchAlbums: async (
    query: string,
    currentAccountId?: string | null,
    limit = 10,
  ): Promise<Album[]> => {
    const albums = await prisma.album.findMany({
      where: {
        albumTitle: { contains: query, mode: "insensitive" },
      },
      include: albumInclude(),
      orderBy: {
        albumFavorites: "desc",
      },
      take: limit,
    });

    const favoritedAlbumIds = await getFavoritedAlbumIds(
      prisma,
      currentAccountId,
      albums.map((album) => album.albumId),
    );

    return albums.map((album) => toAlbum(album, favoritedAlbumIds.has(album.albumId)));
  },
  favoriteArtist: async (accountId: string, artistId: string): Promise<Artist | null> => {
    return prisma.$transaction(async (transaction) => {
      const artist = await transaction.artist.findUnique({
        where: { artistId },
        select: { artistId: true, artistFavorites: true },
      });

      if (!artist) {
        return null;
      }

      const insertedRows = await transaction.$executeRawUnsafe<number>(
        `
          INSERT INTO artist_account_favorite (artist_id, account_id)
          VALUES ($1::uuid, $2::uuid)
          ON CONFLICT DO NOTHING
        `,
        artistId,
        accountId,
      );

      if (insertedRows > 0) {
        await transaction.artist.update({
          where: { artistId },
          data: {
            artistFavorites: {
              increment: BigInt(1),
            },
          },
        });
      }

      return readArtist(transaction, artistId, accountId);
    });
  },
  unfavoriteArtist: async (accountId: string, artistId: string): Promise<Artist | null> => {
    return prisma.$transaction(async (transaction) => {
      const artist = await transaction.artist.findUnique({
        where: { artistId },
        select: { artistId: true, artistFavorites: true },
      });

      if (!artist) {
        return null;
      }

      const deletedRows = await transaction.$executeRawUnsafe<number>(
        `
          DELETE FROM artist_account_favorite
          WHERE artist_id = $1::uuid AND account_id = $2::uuid
        `,
        artistId,
        accountId,
      );

      if (deletedRows > 0) {
        await transaction.$executeRawUnsafe(
          `
            UPDATE artist
            SET artist_favorites = GREATEST(artist_favorites - 1, 0)
            WHERE artist_id = $1::uuid
          `,
          artistId,
        );
      }

      return readArtist(transaction, artistId, accountId);
    });
  },
  listFavoriteArtists: async (accountId: string): Promise<Artist[]> => {
    const favoriteArtistRows = await prisma.$queryRawUnsafe<FavoriteArtistRow[]>(
      `
        SELECT artist_id
        FROM artist_account_favorite
        WHERE account_id = $1::uuid
      `,
      accountId,
    );

    const artistIds = favoriteArtistRows.map((row) => row.artist_id);

    if (artistIds.length === 0) {
      return [];
    }

    const artists = await prisma.artist.findMany({
      where: {
        artistId: {
          in: artistIds,
        },
      },
      include: {
        account: true,
        artistTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [{ artistFavorites: "desc" }, { account: { name: "asc" } }],
    });

    return Promise.all(
      artists.map(async (artist) => {
        const [albumCount, trackCount] = await Promise.all([
          prisma.album.count({
            where: {
              albumArtists: {
                some: { artistId: artist.artistId },
              },
            },
          }),
          prisma.track.count({
            where: {
              OR: [
                { mainArtists: { some: { artistId: artist.artistId } } },
                { featArtists: { some: { artistId: artist.artistId } } },
              ],
            },
          }),
        ]);

        return toArtist(artist, albumCount, trackCount, true);
      }),
    );
  },
  favoriteAlbum: async (accountId: string, albumId: string): Promise<Album | null> => {
    return prisma.$transaction(async (transaction) => {
      const album = await transaction.album.findUnique({
        where: { albumId },
        select: { albumId: true, albumFavorites: true },
      });

      if (!album) {
        return null;
      }

      const insertedRows = await transaction.$executeRawUnsafe<number>(
        `
          INSERT INTO album_account_favorite (album_id, account_id)
          VALUES ($1::uuid, $2::uuid)
          ON CONFLICT DO NOTHING
        `,
        albumId,
        accountId,
      );

      if (insertedRows > 0) {
        await transaction.album.update({
          where: { albumId },
          data: {
            albumFavorites: { increment: 1 },
          },
        });
      }

      return readAlbum(transaction, albumId, accountId);
    });
  },
  unfavoriteAlbum: async (accountId: string, albumId: string): Promise<Album | null> => {
    return prisma.$transaction(async (transaction) => {
      const album = await transaction.album.findUnique({
        where: { albumId },
        select: { albumId: true, albumFavorites: true },
      });

      if (!album) {
        return null;
      }

      const deletedRows = await transaction.$executeRawUnsafe<number>(
        `
          DELETE FROM album_account_favorite
          WHERE album_id = $1::uuid AND account_id = $2::uuid
        `,
        albumId,
        accountId,
      );

      if (deletedRows > 0) {
        const nextFavorites = toBigInt(album.albumFavorites) - BigInt(1);

        await transaction.album.update({
          where: { albumId },
          data: {
            albumFavorites: nextFavorites > BigInt(0) ? nextFavorites : BigInt(0),
          },
        });
      }

      return readAlbum(transaction, albumId, accountId);
    });
  },
  listFavoriteAlbums: async (accountId: string): Promise<Album[]> => {
    const favoriteAlbumRows = await prisma.$queryRawUnsafe<FavoriteAlbumRow[]>(
      `
        SELECT album_id
        FROM album_account_favorite
        WHERE account_id = $1::uuid
      `,
      accountId,
    );

    const albumIds = favoriteAlbumRows.map((row) => row.album_id);

    if (albumIds.length === 0) {
      return [];
    }

    const albums = await prisma.album.findMany({
      where: {
        albumId: {
          in: albumIds,
        },
      },
      include: albumInclude(),
      orderBy: [{ albumFavorites: "desc" }, { albumTitle: "asc" }],
    });

    return albums.map((album) => toAlbum(album, true));
  },
});
