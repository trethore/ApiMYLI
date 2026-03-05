import type { Account } from "packages/domain/src/entities/account";
import type {
  AccountRepository,
  CreateAccountData,
} from "packages/domain/src/repositories/account-repository";

export const createAccount = async (
  repository: AccountRepository,
  data: CreateAccountData,
): Promise<Account> => {
  return repository.create(data);
};
