import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export const deleteAccount = async (
  repository: AccountRepository,
  id: string
): Promise<boolean> => {
  return repository.delete(id);
};
