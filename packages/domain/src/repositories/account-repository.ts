import type { Account } from "packages/domain/src/entities/account";

export type CreateAccountData = {
  login?: string | null;
  password?: string | null;
  name?: string | null;
  email?: string | null;
};

export type UpdateAccountData = Partial<Pick<Account, "login" | "password" | "name" | "email">>;

export type AccountRepository = {
  create(data: CreateAccountData): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  update(id: string, data: UpdateAccountData): Promise<Account | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<Account[]>;
};
