import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export type UpdatePlaylistInput = {
  name?: string | null;
};

export const updatePlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  playlistId: string,
  input: UpdatePlaylistInput,
): Promise<Playlist | null> => {
  const updateData = {
    name: input.name === undefined ? undefined : input.name?.trim() ?? null,
  };

  if (updateData.name !== undefined && !updateData.name) {
    throw new Error("Playlist name is required");
  }

  return repository.update(accountId, playlistId, updateData);
};
