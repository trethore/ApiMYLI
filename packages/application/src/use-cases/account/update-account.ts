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

  if (input.login !== undefined) {
    if (input.login === null) {
      updateData.login = null;
    } else {
      const normalizedLogin = input.login.trim();
      if (!normalizedLogin) {
        throw new Error("Login is required");
      }

      const existingLogin = await dependencies.accountRepository.findByLogin(normalizedLogin);
      if (existingLogin && existingLogin.accountId !== targetAccountId) {
        throw new Error("Login already in use");
      }

      updateData.login = normalizedLogin;
    }
  }

  if (input.email !== undefined) {
    if (input.email === null) {
      updateData.email = null;
    } else {
      const normalizedEmail = input.email.trim();
      if (!normalizedEmail) {
        throw new Error("Email is required");
      }

      const existingEmail = await dependencies.accountRepository.findByEmail(normalizedEmail);
      if (existingEmail && existingEmail.accountId !== targetAccountId) {
        throw new Error("Email already in use");
      }

      updateData.email = normalizedEmail;
    }
  }

  if (input.password !== undefined) {
    if (input.password === null) {
      updateData.password = null;
    } else {
      validatePassword(input.password);
      updateData.password = await dependencies.passwordHasher.hash(input.password);
    }
  }

  return dependencies.accountRepository.update(targetAccountId, updateData);
};
