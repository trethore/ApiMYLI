import type { Account } from "packages/domain/src/entities/account";
import type {
  AccountRepository,
  UpdateAccountData,
} from "packages/domain/src/repositories/account-repository";
import type { PasswordHasherPort } from "packages/application/src/ports/security/password-hasher-port";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{12,}$/;

const validatePassword = (password: string): void => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      "Password must be at least 12 characters long and include at least one uppercase letter and one special character.",
    );
  }
};

const resolveLoginUpdate = async (
  accountRepository: AccountRepository,
  targetAccountId: string,
  login: string | null | undefined,
): Promise<string | null | undefined> => {
  if (login === undefined) {
    return undefined;
  }

  if (login === null) {
    return null;
  }

  const normalizedLogin = login.trim();
  if (!normalizedLogin) {
    throw new Error("Login is required");
  }

  const existingLogin = await accountRepository.findByLogin(normalizedLogin);
  if (existingLogin && existingLogin.accountId !== targetAccountId) {
    throw new Error("Login already in use");
  }

  return normalizedLogin;
};

const resolveEmailUpdate = async (
  accountRepository: AccountRepository,
  targetAccountId: string,
  email: string | null | undefined,
): Promise<string | null | undefined> => {
  if (email === undefined) {
    return undefined;
  }

  if (email === null) {
    return null;
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  const existingEmail = await accountRepository.findByEmail(normalizedEmail);
  if (existingEmail && existingEmail.accountId !== targetAccountId) {
    throw new Error("Email already in use");
  }

  return normalizedEmail;
};

const resolvePasswordUpdate = async (
  passwordHasher: PasswordHasherPort,
  password: string | null | undefined,
): Promise<string | null | undefined> => {
  if (password === undefined) {
    return undefined;
  }

  if (password === null) {
    return null;
  }

  validatePassword(password);
  return passwordHasher.hash(password);
};

export type UpdateAccountInput = {
  login?: string | null;
  email?: string | null;
  password?: string | null;
  name?: string | null;
  isArtist?: boolean | null;
};

export type UpdateAccountDependencies = {
  accountRepository: AccountRepository;
  passwordHasher: PasswordHasherPort;
};

export const updateAccount = async (
  dependencies: UpdateAccountDependencies,
  currentAccountId: string,
  targetAccountId: string,
  input: UpdateAccountInput,
): Promise<Account | null> => {
  if (currentAccountId !== targetAccountId) {
    throw new Error("Unauthorized");
  }

  const updateData: UpdateAccountData = {
    name: input.name,
    isArtist: input.isArtist ?? undefined,
  };

  const loginUpdate = await resolveLoginUpdate(
    dependencies.accountRepository,
    targetAccountId,
    input.login,
  );
  if (loginUpdate !== undefined) {
    updateData.login = loginUpdate;
  }

  const emailUpdate = await resolveEmailUpdate(
    dependencies.accountRepository,
    targetAccountId,
    input.email,
  );
  if (emailUpdate !== undefined) {
    updateData.email = emailUpdate;
  }

  const passwordUpdate = await resolvePasswordUpdate(dependencies.passwordHasher, input.password);
  if (passwordUpdate !== undefined) {
    updateData.password = passwordUpdate;
  }

  return dependencies.accountRepository.update(targetAccountId, updateData);
};
