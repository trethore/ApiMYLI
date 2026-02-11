import "dotenv/config";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";

import { buildClearDatabaseSql } from "./seed/clear-database";
import {
  buildAlbumsSql,
  buildArtistsSql,
  buildAudioFeaturesSql,
  buildCleanupSql,
  buildGenresSql,
  buildTagsSql,
  buildTracksSql,
  buildUsersSql,
} from "./seed/import-core";
import { buildSettingsAndHelpersSql } from "./seed/settings-helpers";
import { buildTemporalFeaturesSql } from "./seed/temporal-features";
import type { SeedFiles } from "./seed/types";

const DEFAULT_SEED_DATA_DIRECTORY = join(import.meta.dir, "seed-data/clean");

function createSeedFiles(seedDataDirectory: string): SeedFiles {
  return {
    genres: join(seedDataDirectory, "clean_genres.csv"),
    artists: join(seedDataDirectory, "clean_raw_artists.csv"),
    albums: join(seedDataDirectory, "clean_raw_albums.csv"),
    tracks: join(seedDataDirectory, "clean_tracks.csv"),
    rawTracks: join(seedDataDirectory, "clean_raw_tracks.csv"),
    echonest: join(seedDataDirectory, "clean_echonest.csv"),
    features: join(seedDataDirectory, "clean_features.csv"),
    answers: join(seedDataDirectory, "clean_answers.csv"),
  };
}

async function ensureFileExists(filePath: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new Error(
      `Missing required seed file: ${filePath}. Run 'bun run --filter api seed:download' first.`,
    );
  }
}

async function ensureSeedFilesExist(seedFiles: SeedFiles): Promise<void> {
  for (const filePath of Object.values(seedFiles)) {
    await ensureFileExists(filePath);
  }
}

async function readCsvHeaderColumns(filePath: string): Promise<string[]> {
  const sample = await Bun.file(filePath).slice(0, 1_048_576).text();

  const firstLine = sample.split(/\r?\n/u, 1)[0]?.trim();
  if (firstLine === undefined || firstLine.length === 0) {
    throw new Error(`The CSV file ${filePath} is empty.`);
  }

  const columns = firstLine
    .split(",")
    .map((column: string) => column.trim().replace(/^"(.*)"$/u, "$1"));

  if (columns.length === 0) {
    throw new Error(`Unable to read CSV columns from ${filePath}.`);
  }

  return columns;
}

async function buildSeedSql(
  seedFiles: SeedFiles,
  temporalFeatureColumns: string[],
): Promise<string> {
  const [
    clearDatabaseSql,
    settingsAndHelpersSql,
    genresSql,
    artistsSql,
    albumsSql,
    tracksSql,
    tagsSql,
    audioFeaturesSql,
    temporalFeaturesSql,
    usersSql,
    cleanupSql,
  ] = await Promise.all([
    buildClearDatabaseSql(),
    buildSettingsAndHelpersSql(),
    buildGenresSql(seedFiles),
    buildArtistsSql(seedFiles),
    buildAlbumsSql(seedFiles),
    buildTracksSql(seedFiles),
    buildTagsSql(),
    buildAudioFeaturesSql(seedFiles),
    buildTemporalFeaturesSql(seedFiles.features, temporalFeatureColumns),
    buildUsersSql(seedFiles),
    buildCleanupSql(),
  ]);

  return [
    clearDatabaseSql,
    settingsAndHelpersSql,
    genresSql,
    artistsSql,
    albumsSql,
    tracksSql,
    tagsSql,
    audioFeaturesSql,
    temporalFeaturesSql,
    usersSql,
    cleanupSql,
  ].join("\n\n");
}

async function executeSeedSql(sqlScript: string): Promise<void> {
  const psqlBinary = Bun.which("psql");
  if (psqlBinary === null) {
    throw new Error("The 'psql' command is required but was not found on this machine.");
  }

  const databaseUrl = Bun.env.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }

  await new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void) => {
    const child = spawn(psqlBinary, ["--set", "ON_ERROR_STOP=1", databaseUrl], {
      stdio: ["pipe", "inherit", "inherit"],
    });

    child.on("error", (error: Error) => {
      reject(error);
    });

    child.on("close", (exitCode: number | null) => {
      if (exitCode === 0) {
        resolve();
        return;
      }

      reject(new Error(`Seeding failed with psql exit code ${exitCode ?? "unknown"}.`));
    });

    child.stdin.end(sqlScript);
  });
}

async function main(): Promise<void> {
  const seedDataDirectory = Bun.env.SEED_DATA_DIR ?? DEFAULT_SEED_DATA_DIRECTORY;
  const seedFiles = createSeedFiles(seedDataDirectory);

  await ensureSeedFilesExist(seedFiles);

  const temporalFeatureColumns = await readCsvHeaderColumns(seedFiles.features);
  const sqlScript = await buildSeedSql(seedFiles, temporalFeatureColumns);

  console.log("Running seed pipeline...");
  await executeSeedSql(sqlScript);
  console.log("Seeding completed successfully.");
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
