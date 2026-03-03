import type { Account } from "packages/domain/src/entities/account";
import type { CreateAccountData, AccountRepository } from "packages/domain/src/repositories/account-repository";

export const createAccount = async (
  repository: AccountRepository,
  data: CreateAccountData
): Promise<Account> => {
  return repository.create(data);
};
