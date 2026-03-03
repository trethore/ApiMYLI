import type { UserRepository } from "packages/domain/src/repositories/user-repository";

export const deleteUser = async (
  repository: UserRepository,
  id: string
): Promise<boolean> => {
  return repository.delete(id);
};
