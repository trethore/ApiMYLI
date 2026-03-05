import type { Album } from "packages/domain/src/entities/album";
import type { PlaylistSummary } from "packages/domain/src/entities/playlist-summary";
import type { ArtistSummary, Track } from "packages/domain/src/entities/track";

export type PinnedItemType = "TRACK" | "ALBUM" | "ARTIST" | "PLAYLIST";

export type PinnedItem = {
  slot: number;
  itemType: PinnedItemType;
  pinnedAt: Date;
  track: Track | null;
  album: Album | null;
  artist: ArtistSummary | null;
  playlist: PlaylistSummary | null;
};
