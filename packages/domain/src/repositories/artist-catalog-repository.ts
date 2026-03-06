import type { Album } from "packages/domain/src/entities/album";
import type { Artist } from "packages/domain/src/entities/artist";

export type ArtistCatalogRepository = {
  findById(artistId: string): Promise<Artist | null>;
  listAlbumsByArtistId(artistId: string): Promise<Album[]>;
  searchArtists(query: string, limit?: number): Promise<Artist[]>;
  searchAlbums(query: string, limit?: number): Promise<Album[]>;
};
