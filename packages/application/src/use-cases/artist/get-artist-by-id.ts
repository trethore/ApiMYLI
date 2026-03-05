import type { Artist } from "packages/domain/src/entities/artist";
import type { ArtistCatalogRepository } from "packages/domain/src/repositories/artist-catalog-repository";

export const getArtistById = async (
  repository: ArtistCatalogRepository,
  artistId: string,
): Promise<Artist | null> => {
  return repository.findById(artistId);
};
