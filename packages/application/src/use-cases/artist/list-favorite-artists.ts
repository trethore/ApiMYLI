import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const listFavoriteArtists = async (
  repository: ArtistCatalogRepository,
  accountId: string,
): Promise<Artist[]> => {
  return repository.listFavoriteArtists(accountId);
};
