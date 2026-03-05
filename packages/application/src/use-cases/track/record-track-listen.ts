import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

export const recordTrackListen = async (
  repository: TrackLibraryRepository,
  accountId: string,
  trackId: string,
): Promise<boolean> => {
  return repository.recordTrackListen(accountId, trackId);
};
