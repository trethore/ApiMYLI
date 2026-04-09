import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";
import type { TrackCatalogRepository } from "packages/domain/src/repositories/track-catalog-repository";
import type { PlaylistRepository } from "packages/domain/src/repositories/playlist-repository";
import type { GenreRepository } from "packages/domain/src/repositories/genre-repository";
import type { Track } from "packages/domain/src/entities/track";
import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";
import type { Playlist } from "packages/domain/src/entities/playlist";
import { Genre } from "packages/domain/src/entities/genre";

export type SearchResults = {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  genres: Genre[];
};

export const searchGlobal = async (
  artistRepo: ArtistCatalogRepository,
  trackRepo: TrackCatalogRepository,
  playlistRepo: PlaylistRepository,
  genreRepo: GenreRepository,
  query: string,
  limit: number,
  currentAccountId?: string | null,
): Promise<SearchResults> => {
  if (!query || query.trim().length === 0) {
    return { tracks: [], albums: [], artists: [], playlists: [], genres: [] };
  }

  const [tracks, albums, artists, playlists, genres] = await Promise.all([
    trackRepo.searchTracks(query, currentAccountId, limit),
    artistRepo.searchAlbums(query, limit),
    artistRepo.searchArtists(query, limit),
    playlistRepo.searchPlaylists(query, currentAccountId, limit),
    genreRepo.searchGenres(query, currentAccountId, limit),
  ]);

  return { tracks, albums, artists, playlists, genres };
};
