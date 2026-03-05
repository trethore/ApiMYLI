import type { Track } from "packages/domain/src/entities/track";

export type TrackLibraryRepository = {
  likeTrack(accountId: string, trackId: string): Promise<Track | null>;
  unlikeTrack(accountId: string, trackId: string): Promise<Track | null>;
  listLikedTracks(accountId: string): Promise<Track[]>;
  recordTrackListen(accountId: string, trackId: string): Promise<boolean>;
};
