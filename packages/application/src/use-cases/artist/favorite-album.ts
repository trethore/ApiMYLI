import type { Album } from "packages/domain/src/entities/album";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const favoriteAlbum = async (
  repository: ArtistCatalogRepository,
  accountId: string,
  albumId: string,
): Promise<Album | null> => {
  return repository.favoriteAlbum(accountId, albumId);
};
