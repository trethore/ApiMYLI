import type {PrismaClient } from "@prisma/generated/prisma/client";
import { genreInclude, toGenre } from "@/infrastructure/prisma-music-mappers";
import { GenreRepository } from "packages/domain/src/repositories/genre-repository";
import { Genre } from "packages/domain/src/entities/genre";

export const createPrismaGenreRepository = (prisma: PrismaClient): GenreRepository => ({
  searchGenres: async (query: string, currentAccountId?: string | null, limit = 10): Promise<Genre[]> => {
    const genres = await prisma.genre.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
      },
      include: genreInclude(),
      take: limit,
    });
    return genres.map((genre) => toGenre(genre));
  },
});
