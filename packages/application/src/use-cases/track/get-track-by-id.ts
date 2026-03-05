import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";

export const getTrackById = async (
  repository: TrackCatalogRepository,
  trackId: string,
  currentAccountId?: string | null,
): Promise<Track | null> => {
  return repository.findTrackById(trackId, currentAccountId);
};
