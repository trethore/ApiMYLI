import type { PinnedItem } from "packages/domain/src/entities/pinned-item";

export type PinnedItemRepository = {
  listByAccountId(accountId: string): Promise<PinnedItem[]>;
  pinTrack(accountId: string, slot: number, trackId: string): Promise<PinnedItem | null>;
  pinAlbum(accountId: string, slot: number, albumId: string): Promise<PinnedItem | null>;
  pinArtist(accountId: string, slot: number, artistId: string): Promise<PinnedItem | null>;
  pinPlaylist(accountId: string, slot: number, playlistId: string): Promise<PinnedItem | null>;
  unpin(accountId: string, slot: number): Promise<boolean>;
};
