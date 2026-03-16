import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

export const undislikeTrack = async (
  repository: TrackLibraryRepository,
  accountId: string,
  trackId: string,
): Promise<Track | null> => {
  return repository.undislikeTrack(accountId, trackId);
};
