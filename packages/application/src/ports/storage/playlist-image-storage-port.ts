export type SavePlaylistImageInput = {
  bytes: Uint8Array;
};

export type StoredPlaylistImage = {
  imagePath: string;
};

export class InvalidPlaylistImageError extends Error {
  constructor() {
    super("Invalid playlist image");
  }
}

export type PlaylistImageStoragePort = {
  savePlaylistImage(playlistId: string, input: SavePlaylistImageInput): Promise<StoredPlaylistImage>;
  deletePlaylistImage(imagePath: string): Promise<void>;
};
