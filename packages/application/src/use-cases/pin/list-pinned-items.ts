import type { PinnedItem } from "packages/domain/src/entities/pinned-item";
import type { PinnedItemRepository } from "packages/domain/src/repositories/pinned-item-repository";

export const listPinnedItems = async (
  repository: PinnedItemRepository,
  accountId: string,
): Promise<PinnedItem[]> => {
  return repository.listByAccountId(accountId);
};
