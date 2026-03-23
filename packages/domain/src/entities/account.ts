import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";

export type Account = {
  accountId: string;
  login?: string | null;
  password?: string | null;
  name?: string | null;
  role: string | null;
  email?: string | null;
  isArtist: boolean;
  artist?: ArtistProfile | null;
  createdAt?: Date | null;
};
