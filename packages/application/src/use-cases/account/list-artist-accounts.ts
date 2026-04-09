import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const listArtistAccounts = async (repository: AccountRepository): Promise<Account[]> => {
  const accounts = await repository.list();
  return accounts.filter((account) => account.isArtist);
};