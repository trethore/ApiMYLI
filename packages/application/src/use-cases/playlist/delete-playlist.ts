import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export const deletePlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  playlistId: string,
): Promise<boolean> => {
  return repository.delete(accountId, playlistId);
};
