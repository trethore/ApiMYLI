import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

export const listDislikedTracks = async (
  repository: TrackLibraryRepository,
  accountId: string,
): Promise<Track[]> => {
  return repository.listDislikedTracks(accountId);
};
