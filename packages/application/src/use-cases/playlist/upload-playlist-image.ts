import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type {
  PlaylistImageStoragePort,
  SavePlaylistImageInput,
} from "packages/application/src/ports/storage/playlist-image-storage-port";

export class PlaylistNotFoundError extends Error {
  constructor() {
    super("Playlist not found");
  }
}

export class PlaylistAccessDeniedError extends Error {
  constructor() {
    super("Forbidden");
  }
}

export type UploadPlaylistImageResult = {
  imagePath: string;
  playlist: Playlist;
};

export const uploadPlaylistImage = async (
  playlistRepository: PlaylistRepository,
  playlistImageStorage: PlaylistImageStoragePort,
  accountId: string,
  playlistId: string,
  input: SavePlaylistImageInput,
): Promise<UploadPlaylistImageResult> => {
  const playlist = await playlistRepository.findById(playlistId, accountId);

  if (!playlist) {
    throw new PlaylistNotFoundError();
  }

  if (!playlist.isEditable) {
    throw new PlaylistAccessDeniedError();
  }

  const storedImage = await playlistImageStorage.savePlaylistImage(playlistId, input);

  try {
    const updatedPlaylist = await playlistRepository.update(accountId, playlistId, {
      imagePath: storedImage.imagePath,
    });

    if (!updatedPlaylist) {
      throw new Error("Failed to update playlist image path");
    }

    if (playlist.imagePath && playlist.imagePath !== storedImage.imagePath) {
      await playlistImageStorage.deletePlaylistImage(playlist.imagePath);
    }

    return {
      imagePath: storedImage.imagePath,
      playlist: updatedPlaylist,
    };
  } catch (error) {
    if (playlist.imagePath !== storedImage.imagePath) {
      await playlistImageStorage.deletePlaylistImage(storedImage.imagePath);
    }

    throw error;
  }
};
