import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export type UpdatePlaylistInput = {
  name?: string | null;
  description?: string | null;
  imagePath?: string | null;
};

const normalizeOptionalString = (value: string | null | undefined): string | null => {
  const normalizedValue = value?.trim();
  return normalizedValue || null;
};

export const updatePlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  playlistId: string,
  input: UpdatePlaylistInput,
): Promise<Playlist | null> => {
  const updateData = {
    name: input.name === undefined ? undefined : input.name?.trim() ?? null,
    description: input.description === undefined ? undefined : normalizeOptionalString(input.description),
    imagePath: input.imagePath === undefined ? undefined : normalizeOptionalString(input.imagePath),
  };

  if (updateData.name !== undefined && !updateData.name) {
    throw new Error("Playlist name is required");
  }

  return repository.update(accountId, playlistId, updateData);
};
