import type { ArtistSummary } from "packages/domain/src/entities/track";

export type Album = {
  albumId: string;
  title: string | null;
  imageUrl: string | null;
  type: string | null;
  dateReleased: Date | null;
  tracksCount: number | null;
  listens: number | null;
  favorites: number | null;
  comments: number | null;
  producer: string | null;
  artists: ArtistSummary[];
};
