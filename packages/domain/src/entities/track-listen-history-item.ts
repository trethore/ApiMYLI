import type { Track } from "packages/domain/src/entities/track";

export type TrackListenHistoryItem = {
  listenHistoryItemId: string;
  listenedAt: Date;
  track: Track;
};
