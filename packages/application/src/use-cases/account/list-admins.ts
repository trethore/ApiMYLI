import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export class ListAdminsUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(): Promise<Account[]> {
    const accounts = await this.accountRepository.list();
    return accounts.filter(
      (account) => account.role === "admin" || account.role === "super_admin",
    );
  }
}