import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const getAccountById = async (
  repository: AccountRepository,
  id: string
): Promise<Account | null> => {
  return repository.findById(id);
};
