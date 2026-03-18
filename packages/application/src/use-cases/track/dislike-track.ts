import type { Track } from "packages/domain/src/entities/track";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

export const dislikeTrack = async (
  repository: TrackLibraryRepository,
  accountId: string,
  trackId: string,
): Promise<Track | null> => {
  return repository.dislikeTrack(accountId, trackId);
};
