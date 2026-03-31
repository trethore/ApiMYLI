import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export type CreateBlindtestInput = {
  name: string;
  length: number;
  yearBegin: number;
  yearEnd: number;
  difficulty: number;
  instrumental: boolean
  compulsoryTrackIds: string[];
  trackIds: string[];
  genreIds: string[];
  artistIds: string[];
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
