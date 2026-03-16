import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export type CreatePlaylistInput = {
  name: string;
  description?: string | null;
  imagePath?: string | null;
};

const normalizeOptionalString = (value: string | null | undefined): string | null => {
  const normalizedValue = value?.trim();
  return normalizedValue || null;
};

export const createPlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  input: CreatePlaylistInput,
): Promise<Playlist> => {
  const name = input.name.trim();
  const description = normalizeOptionalString(input.description);
  const imagePath = normalizeOptionalString(input.imagePath);

  if (!name) {
    throw new Error("Playlist name is required");
  }

  return repository.create(accountId, { name, description, imagePath });
};
