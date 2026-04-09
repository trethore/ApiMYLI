import type { Account } from "@domain/entities/account";
import type { AccountRepository } from "@domain/repositories/account-repository";

export class ListAdminsUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(): Promise<Account[]> {
    const accounts = await this.accountRepository.list();
    return accounts.filter(
      (account) => account.role === "admin" || account.role === "super_admin",
    );
  }
}