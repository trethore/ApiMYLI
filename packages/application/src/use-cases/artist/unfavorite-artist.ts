import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const unfavoriteArtist = async (
  repository: ArtistCatalogRepository,
  accountId: string,
  artistId: string,
): Promise<Artist | null> => {
  return repository.unfavoriteArtist(accountId, artistId);
};
