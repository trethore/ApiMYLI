import { CreateBlindtestInput } from "packages/application/src/use-cases/blindtest/create-blindtest";
import { UpdateBlindtestInput } from "packages/application/src/use-cases/blindtest/update-blindtest";
import type { Blindtest } from "packages/domain/src/entities/blindtest";

export type BlindtestRepository = {
  findById(blindtestId: string, currentAccountId?: string | null): Promise<Blindtest | null>;
  listByAccountId(accountId: string): Promise<Blindtest[]>;
  create(accountId: string, data: CreateBlindtestInput): Promise<Blindtest>;
  update(accountId: string, blindtestId: string, data: UpdateBlindtestInput): Promise<Blindtest | null>;
  delete(accountId: string, blindtestId: string): Promise<boolean>;
  addCompulsoryTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
  removeCompulsoryTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
  addTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
  removeTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
};
