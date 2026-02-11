import { loadSqlTemplate } from "./sql-loader";
import { applySqlTemplate, toSqlLiteral } from "./sql-utils";
import type { SeedFiles } from "./types";

export async function buildGenresSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("genres.sql");
  return applySqlTemplate(template, {
    GENRES_CSV: toSqlLiteral(files.genres),
  });
}

export async function buildArtistsSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("artists.sql");
  return applySqlTemplate(template, {
    ARTISTS_CSV: toSqlLiteral(files.artists),
  });
}

export async function buildAlbumsSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("albums.sql");
  return applySqlTemplate(template, {
    ALBUMS_CSV: toSqlLiteral(files.albums),
  });
}

export async function buildTracksSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("tracks.sql");
  return applySqlTemplate(template, {
    TRACKS_CSV: toSqlLiteral(files.tracks),
    RAW_TRACKS_CSV: toSqlLiteral(files.rawTracks),
  });
}

export async function buildTagsSql(): Promise<string> {
  return loadSqlTemplate("tags.sql");
}

export async function buildAudioFeaturesSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("audio-features.sql");
  return applySqlTemplate(template, {
    ECHONEST_CSV: toSqlLiteral(files.echonest),
  });
}

export async function buildUsersSql(files: SeedFiles): Promise<string> {
  const template = await loadSqlTemplate("users.sql");
  return applySqlTemplate(template, {
    ANSWERS_CSV: toSqlLiteral(files.answers),
  });
}

export async function buildCleanupSql(): Promise<string> {
  return loadSqlTemplate("cleanup.sql");
}
