import type { Album } from "packages/domain/src/entities/album";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const listFavoriteAlbums = async (
  repository: ArtistCatalogRepository,
  accountId: string,
): Promise<Album[]> => {
  return repository.listFavoriteAlbums(accountId);
};
