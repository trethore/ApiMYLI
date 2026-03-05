import type { Album } from "packages/domain/src/entities/album";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const listArtistAlbums = async (
  repository: ArtistCatalogRepository,
  artistId: string,
): Promise<Album[]> => {
  return repository.listAlbumsByArtistId(artistId);
};
