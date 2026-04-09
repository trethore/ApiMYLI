import type { Blindtest } from "packages/domain/src/entities/blindtest";
import type { BlindtestRepository } from "packages/domain/src/repositories/blindtest-repository";

export const removeCompulsoryTrackFromBlindtest = async (
  repository: BlindtestRepository,
  accountId: string,
  blindtestId: string,
  trackId: string,
): Promise<Blindtest | null> => {
  return repository.removeCompulsoryTrack(accountId, blindtestId, trackId);
};
