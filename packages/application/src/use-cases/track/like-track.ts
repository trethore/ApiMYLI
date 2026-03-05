import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

export const likeTrack = async (
  repository: TrackLibraryRepository,
  accountId: string,
  trackId: string,
): Promise<Track | null> => {
  return repository.likeTrack(accountId, trackId);
};
