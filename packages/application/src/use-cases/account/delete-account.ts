import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const deleteAccount = async (
  repository: AccountRepository,
  currentAccountId: string,
  role: string,
  targetAccountId: string,
): Promise<boolean> => {
  if (currentAccountId !== targetAccountId && role !== "super_admin" && role !== "admin") {
    throw new Error("Unauthorized");
  }

  return repository.delete(targetAccountId);
};
