import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const getAccountById = async (
  repository: AccountRepository,
  currentAccountId: string,
  targetAccountId: string,
): Promise<Account | null> => {
  if (currentAccountId !== targetAccountId) {
    throw new Error("Unauthorized");
  }

  return repository.findById(targetAccountId);
};
