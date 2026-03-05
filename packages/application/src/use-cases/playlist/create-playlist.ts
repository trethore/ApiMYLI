import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export type CreatePlaylistInput = {
  name: string;
};

export const createPlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  input: CreatePlaylistInput,
): Promise<Playlist> => {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Playlist name is required");
  }

  return repository.create(accountId, { name });
};
