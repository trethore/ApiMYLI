import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export type UpdateBlindtestInput = {
  name: string;
  length: number;
  yearBegin: number;
  yearEnd: number;
  difficulty: number;
  instrumental: boolean;
  isEditable: boolean;
  trackCount: number;
  compulsoryTrackIds: string[];
  genreIds: string[];
  artistIds: string[];
};

export const updateBlindtest = async (
  repository: BlindtestRepository,
  accountId: string,
  blindtestId: string,
  input: UpdateBlindtestInput,
): Promise<Blindtest | null> => {
  const updateData = {
    name: input.name === undefined ? undefined : input.name?.trim() ?? null,
  };

  if (updateData.name !== undefined && !updateData.name) {
    throw new Error("Blindtest name is required");
  }

  return repository.update(accountId, blindtestId, input);
};
