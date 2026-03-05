import type { Track } from "packages/domain/src/entities/track";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";

export const listTracksByAlbum = async (
  repository: TrackCatalogRepository,
  albumId: string,
  currentAccountId?: string | null,
): Promise<Track[]> => {
  return repository.listTracksByAlbum(albumId, currentAccountId);
};
