import type { Track } from "packages/domain/src/entities/track";
import { Genre } from "./genre";
import { Artist } from "./artist";

export type Blindtest = {
  blindtestId: string;
  name: string;
  length: number;
  yearBegin: number;
  yearEnd: number;
  difficulty: number;
  instrumental: boolean;
  isEditable: boolean;
  trackCount: number;
  compulsoryTracks: Track[];
  tracks: Track[];
  genres: Genre[];
  artists: Artist[];
};
