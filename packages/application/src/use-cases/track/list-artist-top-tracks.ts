import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const listArtistTopTracks = async (
  repository: TrackCatalogRepository,
  artistId: string,
  currentAccountId?: string | null,
  limit?: number,
): Promise<Track[]> => {
  const resolvedLimit =
    limit === undefined ? DEFAULT_LIMIT : Math.min(Math.max(limit, 1), MAX_LIMIT);

  return repository.listArtistTopTracks(artistId, currentAccountId, resolvedLimit);
};
