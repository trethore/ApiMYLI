import type { TrackListenHistoryItem } from "packages/domain/src/entities/track-listen-history-item";
import type { Track } from "packages/domain/src/entities/track";

export type TrackLibraryRepository = {
  likeTrack(accountId: string, trackId: string): Promise<Track | null>;
  unlikeTrack(accountId: string, trackId: string): Promise<Track | null>;
  dislikeTrack(accountId: string, trackId: string): Promise<Track | null>;
  undislikeTrack(accountId: string, trackId: string): Promise<Track | null>;
  listLikedTracks(accountId: string): Promise<Track[]>;
  listDislikedTracks(accountId: string): Promise<Track[]>;
  listTrackListenHistory(accountId: string, limit?: number): Promise<TrackListenHistoryItem[]>;
  recordTrackListen(accountId: string, trackId: string): Promise<boolean>;
};
