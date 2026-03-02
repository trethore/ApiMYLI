import type { User } from "packages/domain/src/entities/user";
import type { UpdateUserData, UserRepository } from "packages/domain/src/repositories/user-repository";

export const updateUser = async (
  repository: UserRepository,
  id: string,
  data: UpdateUserData
): Promise<User | null> => {
  return repository.update(id, data);
};
