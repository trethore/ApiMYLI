import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const deleteAccount = async (
  repository: AccountRepository,
  currentAccountId: string,
  targetAccountId: string,
): Promise<boolean> => {
  if (currentAccountId !== targetAccountId) {
    throw new Error("Unauthorized");
  }

  return repository.delete(targetAccountId);
};
