import type { Playlist } from "packages/domain/src/entities/playlist";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";

export const addTrackToPlaylist = async (
  repository: PlaylistRepository,
  accountId: string,
  playlistId: string,
  trackId: string,
): Promise<Playlist | null> => {
  return repository.addTrack(accountId, playlistId, trackId);
};
