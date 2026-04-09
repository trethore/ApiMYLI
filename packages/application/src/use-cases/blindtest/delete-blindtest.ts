import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export const deleteBlindtest = async (
  repository: BlindtestRepository,
  accountId: string,
  blindtestId: string,
): Promise<boolean> => {
  return repository.delete(accountId, blindtestId);
};
