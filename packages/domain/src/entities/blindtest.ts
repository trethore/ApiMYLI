import type { Track } from "packages/domain/src/entities/track";
import { Genre } from "./genre";
import { Artist } from "./artist";

export type Blindtest = {
  blindtestId: string;
  name: string | null;
  length: number | null;
  yearBegin: number | null;
  yearEnd: number | null;
  difficulty: number | null;
  instrumental: boolean | null;
  isEditable: boolean;
  trackCount: number;
  compulsoryTracks: Track[];
  tracks: Track[];
  genres: Genre[];
  artists: Artist[];
  ownerDisplayName: string | null,
};
