import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const listAccounts = async (
  repository: AccountRepository
): Promise<Account[]> => {
  return repository.list();
};
