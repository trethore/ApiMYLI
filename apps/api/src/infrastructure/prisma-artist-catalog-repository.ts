import type { PrismaClient } from "@prisma/generated/prisma/client";
import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import { albumInclude, toAlbum } from "@/infrastructure/prisma-music-mappers";

const toNullableNumber = (value: bigint | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
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

export const createPrismaArtistCatalogRepository = (
  prisma: PrismaClient,
): ArtistCatalogRepository => ({
  findById: async (artistId: string): Promise<Artist | null> => {
    const artist = await prisma.artist.findUnique({
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

    const [albumCount, trackCount] = await Promise.all([
      prisma.album.count({
        where: {
          albumArtists: {
            some: { artistId },
          },
        },
      }),
      prisma.track.count({
        where: {
          OR: [
            { mainArtists: { some: { artistId } } },
            { featArtists: { some: { artistId } } },
          ],
        },
      }),
    ]);

    return {
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
    };
  },
  listAlbumsByArtistId: async (artistId: string): Promise<Album[]> => {
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

    return albums.map(toAlbum);
  },
});
