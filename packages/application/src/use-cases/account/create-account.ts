import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;

const validatePassword = (password: string): void => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      "Password must be at least 12 characters long and include at least one uppercase letter and one special character.",
    );
  }
};

export type CreateAccountInput = {
  login: string;
  email: string;
  password: string;
  name: string;
  isArtist?: boolean | null;
};

export type CreateAccountDependencies = {
  accountRepository: AccountRepository;
  passwordHasher: PasswordHasherPort;
};

export const createAccount = async (
  dependencies: CreateAccountDependencies,
  input: CreateAccountInput,
): Promise<Account> => {
  const login = input.login.trim();
  const email = input.email.trim();

  if (!login) {
    throw new Error("Login is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  const existingLogin = await dependencies.accountRepository.findByLogin(login);
  if (existingLogin) {
    throw new Error("Login already in use");
  }

  const existingEmail = await dependencies.accountRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error("Email already in use");
  }

  validatePassword(input.password);
  const passwordHash = await dependencies.passwordHasher.hash(input.password);

  return dependencies.accountRepository.create({
    login,
    email,
    password: passwordHash,
    name: input.name,
    isArtist: input.isArtist ?? false,
  });
};
