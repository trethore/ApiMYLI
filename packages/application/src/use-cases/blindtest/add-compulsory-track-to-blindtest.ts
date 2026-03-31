import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export const addCompulsoryTrackToBlindtest = async (
  repository: BlindtestRepository,
  accountId: string,
  blindtestId: string,
  trackId: string,
): Promise<Blindtest | null> => {
  return repository.addCompulsoryTrack(accountId, blindtestId, trackId);
};
