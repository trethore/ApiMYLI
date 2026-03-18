import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { Track } from "packages/domain/src/entities/track";
import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";
import type { Playlist } from "packages/domain/src/entities/playlist";

export type SearchResults = {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
};

export const searchGlobal = async (
  artistRepo: ArtistCatalogRepository,
  trackRepo: TrackCatalogRepository,
  playlistRepo: PlaylistRepository,
  query: string,
  limit: number,
  currentAccountId?: string | null,
): Promise<SearchResults> => {
  if (!query || query.trim().length === 0) {
    return { tracks: [], albums: [], artists: [], playlists: [] };
  }

  const [tracks, albums, artists, playlists] = await Promise.all([
    trackRepo.searchTracks(query, currentAccountId, limit),
    artistRepo.searchAlbums(query, currentAccountId, limit),
    artistRepo.searchArtists(query, currentAccountId, limit),
    playlistRepo.searchPlaylists(query, currentAccountId, limit),
  ]);

  return { tracks, albums, artists, playlists };
};
