import type { Blindtest } from "packages/domain/src/entities/blindtest";

export type CreateBlindtestData = {
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

export type UpdateBlindtestData = {
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

export type BlindtestRepository = {
  findById(blindtestId: string, currentAccountId?: string | null): Promise<Blindtest | null>;
  listByAccountId(accountId: string): Promise<Blindtest[]>;
  create(accountId: string, data: CreateBlindtestData): Promise<Blindtest>;
  update(accountId: string, blindtestId: string, data: UpdateBlindtestData): Promise<Blindtest | null>;
  delete(accountId: string, blindtestId: string): Promise<boolean>;
  addCompulsoryTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
  removeCompulsoryTrack(accountId: string, blindtestId: string, trackId: string): Promise<Blindtest | null>;
};
