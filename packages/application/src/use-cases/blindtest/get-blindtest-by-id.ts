import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export const getBlindtestById = async (
  repository: BlindtestRepository,
  BlindtestId: string,
  currentAccountId?: string | null,
): Promise<Blindtest | null> => {
  return repository.findById(BlindtestId, currentAccountId);
};
