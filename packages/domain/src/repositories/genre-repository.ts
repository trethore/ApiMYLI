import { Genre } from "../entities/genre";

export type GenreRepository = {
  searchGenres(query: string, currentAccountId?: string | null, limit?: number): Promise<Genre[]>;
};
