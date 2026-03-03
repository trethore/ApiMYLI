import type { User } from "packages/domain/src/entities/user";
import type { CreateUserData, UserRepository } from "packages/domain/src/repositories/user-repository";

export const createUser = async (
  repository: UserRepository,
  data: CreateUserData
): Promise<User> => {
  return repository.create(data);
};
