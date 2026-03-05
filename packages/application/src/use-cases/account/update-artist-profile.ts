import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";
import type {
  AccountRepository,
  UpdateArtistProfileData,
} from "packages/domain/src/repositories/account-repository";

export const updateArtistProfile = async (
  repository: AccountRepository,
  currentAccountId: string,
  targetAccountId: string,
  data: UpdateArtistProfileData,
): Promise<ArtistProfile | null> => {
  if (currentAccountId !== targetAccountId) {
    throw new Error("Unauthorized");
  }

  const account = await repository.findById(targetAccountId);
  if (!account) {
    return null;
  }

  if (!account.isArtist) {
    throw new Error("Artist profile is not enabled for this account");
  }

  return repository.updateArtistProfile(targetAccountId, data);
};
