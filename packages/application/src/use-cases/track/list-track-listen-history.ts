import type { TrackListenHistoryItem } from "packages/domain/src/entities/track-listen-history-item";
import type { TrackLibraryRepository } from "packages/domain/src/repositories/track-library-repository";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const listTrackListenHistory = async (
  repository: TrackLibraryRepository,
  accountId: string,
  limit?: number,
): Promise<TrackListenHistoryItem[]> => {
  const resolvedLimit = limit === undefined ? DEFAULT_LIMIT : Math.min(Math.max(limit, 1), MAX_LIMIT);

  return repository.listTrackListenHistory(accountId, resolvedLimit);
};
