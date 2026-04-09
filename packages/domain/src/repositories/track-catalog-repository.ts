import type { Track } from "packages/domain/src/entities/track";
import type { ExtraBlindtestConstraints } from "packages/application/src/use-cases/recommendation/get-recommendations";

export type TrackCatalogRepository = {
  findTrackById(trackId: string, currentAccountId?: string | null): Promise<Track | null>;
  listTracksByAlbum(albumId: string, currentAccountId?: string | null): Promise<Track[]>;
  listArtistTopTracks(
    artistId: string,
    currentAccountId?: string | null,
    limit?: number,
  ): Promise<Track[]>;
  searchTracks(query: string, currentAccountId?: string | null, limit?: number): Promise<Track[]>;
  getTracksWithFeatures(trackIds: string[], currentAccountId?: string | null): Promise<Track[]>;
  getRandomTracks(limit: number, excludedIds: string[], currentAccountId?: string | null, extraBlindtestConstraints?: ExtraBlindtestConstraints): Promise<Track[]>;
};
