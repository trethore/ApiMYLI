import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export type CreateBlindtestInput = {
  name: string,
  length: number,
  difficulty: number,
  yearBegin: number | null,
  yearEnd: number | null,
  instrumental: boolean | null;
  genreIds: string[],
  artistIds: string[],
  compulsoryTrackIds: string[]
};

export const createBlindtest = async (
  repository: BlindtestRepository,
  accountId: string,
  input: CreateBlindtestInput,
): Promise<Blindtest> => {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Blindtest name is required");
  }

  return repository.create(accountId, input);
};
