import type { Track } from "packages/domain/src/entities/track";

export type Playlist = {
  playlistId: string;
  name: string | null;
  ownerDisplayName: string | null;
  isEditable: boolean;
  trackCount: number;
  tracks: Track[];
};
