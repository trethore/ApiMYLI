import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import { toTrack, trackInclude } from "@/infrastructure/prisma-music-mappers";

const trackOrderBy: Prisma.TrackOrderByWithRelationInput[] = [
  { trackDiscNumber: "asc" },
  { trackNumber: "asc" },
  { trackTitle: "asc" },
];

export const createPrismaTrackCatalogRepository = (
  prisma: PrismaClient,
): TrackCatalogRepository => ({
  findTrackById: async (trackId: string, currentAccountId?: string | null): Promise<Track | null> => {
    const track = await prisma.track.findUnique({
      where: { trackId },
      include: trackInclude(currentAccountId),
    });

    return track ? toTrack(track) : null;
  },
  listTracksByAlbum: async (
    albumId: string,
    currentAccountId?: string | null,
  ): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: { albumId },
      include: trackInclude(currentAccountId),
      orderBy: trackOrderBy,
    });

    return tracks.map(toTrack);
  },
  listArtistTopTracks: async (
    artistId: string,
    currentAccountId?: string | null,
    limit = 10,
  ): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          { mainArtists: { some: { artistId } } },
          { featArtists: { some: { artistId } } },
        ],
      },
      include: trackInclude(currentAccountId),
      orderBy: [
        { trackListens: "desc" },
        { trackFavorites: "desc" },
        { trackTitle: "asc" },
      ],
      take: limit,
    });

    return tracks.map(toTrack);
  },
});
