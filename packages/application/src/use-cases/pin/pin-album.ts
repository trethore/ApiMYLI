import type { PinnedItem } from "packages/domain/src/entities/pinned-item";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";

const MIN_SLOT = 1;
const MAX_SLOT = 4;

const assertValidSlot = (slot: number): void => {
  if (!Number.isInteger(slot) || slot < MIN_SLOT || slot > MAX_SLOT) {
    throw new Error("Slot must be between 1 and 4");
  }
};

export const pinAlbum = async (
  repository: PinnedItemRepository,
  accountId: string,
  slot: number,
  albumId: string,
): Promise<PinnedItem | null> => {
  assertValidSlot(slot);

  return repository.pinAlbum(accountId, slot, albumId);
};
