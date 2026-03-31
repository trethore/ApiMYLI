import type { Account } from "packages/domain/src/entities/account";
import type { AccountRepository } from "packages/domain/src/repositories/account-repository";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";
import { GraphQLError } from "graphql";

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
    throw new GraphQLError("Pseudo requis");
  }

  if (!email) {
    throw new GraphQLError("Email requis");
  }

  const existingLogin = await dependencies.accountRepository.findByLogin(login);
  if (existingLogin) {
    throw new GraphQLError("Pseudo déjà pris");
  }

  const existingEmail = await dependencies.accountRepository.findByEmail(email);
  if (existingEmail) {
    throw new GraphQLError("Email déjà pris");
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
