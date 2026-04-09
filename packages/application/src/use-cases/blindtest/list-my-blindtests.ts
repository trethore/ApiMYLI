import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export const listMyBlindtests = async (
  repository: BlindtestRepository,
  accountId: string,
): Promise<Blindtest[]> => {
  return repository.listByAccountId(accountId);
};
