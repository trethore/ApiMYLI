import type { Account } from "packages/domain/src/entities/account";
import type { ArtistProfile } from "packages/domain/src/entities/artist-profile";

export type CreateAccountData = {
  login: string;
  password: string;
  name: string;
  email: string;
  isArtist: boolean;
};

export type UpdateAccountData = {
  login?: string | null;
  password?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isArtist?: boolean;
};

export type UpdateArtistProfileData = {
  artistBio?: string | null;
  artistLocation?: string | null;
  artistLatitude?: number | null;
  artistLongitude?: number | null;
  artistActiveYearBegin?: number | null;
  artistActiveYearEnd?: number | null;
  artistFavorites?: number | null;
  artistComments?: number | null;
};

export type AccountRepository = {
  create(data: CreateAccountData): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByLogin(login: string): Promise<Account | null>;
  findByEmail(email: string): Promise<Account | null>;
  update(id: string, data: UpdateAccountData): Promise<Account | null>;
  updateArtistProfile(id: string, data: UpdateArtistProfileData): Promise<ArtistProfile | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<Account[]>;
};
