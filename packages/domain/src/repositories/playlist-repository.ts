import type { Playlist } from "packages/domain/src/entities/playlist";

export type CreatePlaylistData = {
  name: string;
  description: string | null;
  imagePath: string | null;
};

export type UpdatePlaylistData = {
  name?: string | null;
  description?: string | null;
  imagePath?: string | null;
};

export type PlaylistRepository = {
  findById(playlistId: string, currentAccountId?: string | null): Promise<Playlist | null>;
  listByAccountId(accountId: string): Promise<Playlist[]>;
  create(accountId: string, data: CreatePlaylistData): Promise<Playlist>;
  update(accountId: string, playlistId: string, data: UpdatePlaylistData): Promise<Playlist | null>;
  delete(accountId: string, playlistId: string): Promise<boolean>;
  addTrack(accountId: string, playlistId: string, trackId: string): Promise<Playlist | null>;
  removeTrack(accountId: string, playlistId: string, trackId: string): Promise<Playlist | null>;
  searchPlaylists(query: string, currentAccountId?: string | null, limit?: number): Promise<Playlist[]>;
};
