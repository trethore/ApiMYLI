import type { Account } from "packages/domain/src/entities/account";
import type { UpdateAccountData, AccountRepository } from "packages/domain/src/repositories/account-repository";

export const updateAccount = async (
  repository: AccountRepository,
  id: string,
  data: UpdateAccountData
): Promise<Account | null> => {
  return repository.update(id, data);
};
