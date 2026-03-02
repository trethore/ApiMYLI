import { argon2id, hash as argon2hash, verify as argon2verify } from "argon2";

const getPepper = (): string => {
  const pepper = Bun.env.PASSWORD_PEPPER;

  if (!pepper) {
    throw new Error("PASSWORD_PEPPER is required");
  }

  return pepper;
};

export const hashPassword = async (password: string): Promise<string> => {
  const pepper = getPepper();

  return argon2hash(`${password}${pepper}`, {
    type: argon2id,
  });
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const pepper = getPepper();

  return argon2verify(hash, `${password}${pepper}`);
};
