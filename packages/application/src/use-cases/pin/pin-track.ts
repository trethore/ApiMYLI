import type { PinnedItem } from "packages/domain/src/entities/pinned-item";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";

const MIN_SLOT = 1;
const MAX_SLOT = 4;

const assertValidSlot = (slot: number): void => {
  if (!Number.isInteger(slot) || slot < MIN_SLOT || slot > MAX_SLOT) {
    throw new Error("Slot must be between 1 and 4");
  }
};

export const pinTrack = async (
  repository: PinnedItemRepository,
  accountId: string,
  slot: number,
  trackId: string,
): Promise<PinnedItem | null> => {
  assertValidSlot(slot);

  return repository.pinTrack(accountId, slot, trackId);
};
