import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";
import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";

export type LoginAccountInput = {
  email: string;
  password: string;
};

export type LoginAccountDependencies = {
  accountRepository: AccountRepository;
  passwordHasher: PasswordHasherPort;
  authTokenService: AuthTokenServicePort;
};

export type LoginAccountResult = {
  token: string;
  account: Account;
} | null;

export const loginAccount = async (
  dependencies: LoginAccountDependencies,
  input: LoginAccountInput,
): Promise<LoginAccountResult> => {
  const email = input.email.trim();
  const account = await dependencies.accountRepository.findByEmail(email);

  if (!account?.password) {
    return null;
  }

  const isValidPassword = await dependencies.passwordHasher.verify(
    input.password,
    account.password,
  );
  if (!isValidPassword) {
    return null;
  }

  const token = await dependencies.authTokenService.create(account.accountId);
  return { token, account };
};
