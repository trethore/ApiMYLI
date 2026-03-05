import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export const listMyPlaylists = async (
  repository: PlaylistRepository,
  accountId: string,
): Promise<Playlist[]> => {
  return repository.listByAccountId(accountId);
};
