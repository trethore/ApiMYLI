import type { User } from "packages/domain/src/entities/user";
import type { UserRepository } from "packages/domain/src/repositories/user-repository";

export const getUserById = async (
  repository: UserRepository,
  id: string
): Promise<User | null> => {
  return repository.findById(id);
};
