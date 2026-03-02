import type { User } from "packages/domain/src/entities/user";
import type { UserRepository } from "packages/domain/src/repositories/user-repository";

export const listUsers = async (
  repository: UserRepository
): Promise<User[]> => {
  return repository.list();
};
