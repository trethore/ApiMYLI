import type { Prisma, PrismaClient } from "@prisma/generated/prisma/client";
import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import { toTrack, trackInclude } from "@/infrastructure/prisma-music-mappers";

export type ExtraBlindtestConstraints = {
  yearBegin: number | null;
  yearEnd: number | null;
  isInstrumental: boolean | null;
  genreIds: string[];
  artistIds: string[];
  compulsoryTrackIds: string[];
}

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
  searchTracks: async (query: string, currentAccountId?: string | null, limit = 10): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: {
        trackTitle: { contains: query, mode: "insensitive" },
      },
      include: trackInclude(currentAccountId),
      take: limit,
      orderBy: { trackListens: "desc" },
    });
    return tracks.map(toTrack);
  },
  getTracksWithFeatures: async (trackIds: string[], currentAccountId?: string | null): Promise<Track[]> => {
    const tracks = await prisma.track.findMany({
      where: {
        trackId: { in: trackIds },
        audioFeature: { isNot: null },
      },
      include: trackInclude(currentAccountId),
    });
    return tracks.map(toTrack);
  },
  getRandomTracks: async (limit: number, excludedIds: string[], currentAccountId?: string | null, extraBlindtestConstraints?: ExtraBlindtestConstraints): Promise<Track[]> => {
    // Prisma does not have native ORDER BY RANDOM(). 
    // Usually we fetch IDs, shuffle, then take 'limit'.
    const allTrackIds = await prisma.track.findMany({
      where: {

        // Extra constraints for blindtest handling
        ...(extraBlindtestConstraints?.isInstrumental != null && {
          trackInstrumental: extraBlindtestConstraints.isInstrumental,
        }),
        ...(extraBlindtestConstraints && {
          trackDateCreated: {
            ...(extraBlindtestConstraints.yearBegin != null && {
              gte: new Date(`${extraBlindtestConstraints.yearBegin}-01-01`),
            }),
            ...(extraBlindtestConstraints.yearEnd != null && {
              lte: new Date(`${extraBlindtestConstraints.yearEnd}-12-31`),
            }),
          },
        }),
        ...(extraBlindtestConstraints?.genreIds?.length !== undefined && extraBlindtestConstraints?.genreIds?.length > 0 && {
          trackGenres: {
            some: {
              genreId: { in: extraBlindtestConstraints.genreIds },
            },
          },
        }),
        ...(extraBlindtestConstraints?.artistIds?.length !== undefined && extraBlindtestConstraints?.artistIds?.length > 0 && {
          mainArtists: {
            some: {
              artistId: { in: extraBlindtestConstraints.artistIds },
            },
          },
        }),

        trackId: { notIn: excludedIds },
        audioFeature: { isNot: null }, // Prefer tracks that have features for a better radio
      },
      select: { trackId: true },
    });

    // Shuffle and pick
    const shuffled = allTrackIds.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, limit).map((t) => t.trackId);

    if (selectedIds.length === 0) return [];

    const tracks = await prisma.track.findMany({
      where: { trackId: { in: selectedIds } },
      include: trackInclude(currentAccountId),
    });

    return tracks.map(toTrack);
  },
});
