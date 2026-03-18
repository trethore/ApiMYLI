import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const favoriteArtist = async (
  repository: ArtistCatalogRepository,
  accountId: string,
  artistId: string,
): Promise<Artist | null> => {
  return repository.favoriteArtist(accountId, artistId);
};
