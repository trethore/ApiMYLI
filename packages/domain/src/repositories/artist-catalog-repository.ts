import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";

export type ArtistCatalogRepository = {
  findById(artistId: string, currentAccountId?: string | null): Promise<Artist | null>;
  listAlbumsByArtistId(artistId: string, currentAccountId?: string | null): Promise<Album[]>;
  searchArtists(query: string, currentAccountId?: string | null, limit?: number): Promise<Artist[]>;
  searchAlbums(query: string, currentAccountId?: string | null, limit?: number): Promise<Album[]>;
  favoriteArtist(accountId: string, artistId: string): Promise<Artist | null>;
  unfavoriteArtist(accountId: string, artistId: string): Promise<Artist | null>;
  listFavoriteArtists(accountId: string): Promise<Artist[]>;
  favoriteAlbum(accountId: string, albumId: string): Promise<Album | null>;
  unfavoriteAlbum(accountId: string, albumId: string): Promise<Album | null>;
  listFavoriteAlbums(accountId: string): Promise<Album[]>;
};
