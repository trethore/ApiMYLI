import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export const getPlaylistById = async (
  repository: PlaylistRepository,
  playlistId: string,
  currentAccountId?: string | null,
): Promise<Playlist | null> => {
  return repository.findById(playlistId, currentAccountId);
};
