import { readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import "dotenv/config";
import { isPublicTablePresent, runPrismaMigrationSqlFiles, runSeedSqlFiles } from "../scripts/run-psql";

const SQL_DIRECTORY_PATH = resolve(import.meta.dir, "sql");
const PRISMA_MIGRATIONS_DIRECTORY_PATH = resolve(import.meta.dir, "../prisma/migrations");

const listSqlFiles = async (sqlDirectoryPath: string): Promise<string[]> => {
  const entries = await readdir(sqlDirectoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => resolve(sqlDirectoryPath, entry.name))
    .sort((leftPath, rightPath) => basename(leftPath).localeCompare(basename(rightPath)));
};

const listMigrationDirectories = async (migrationsDirectoryPath: string): Promise<string[]> => {
  const entries = await readdir(migrationsDirectoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((leftName, rightName) => leftName.localeCompare(rightName));
};

const ensureDatabaseSchema = async (databaseUrl: string): Promise<void> => {

  const isGenreTablePresent = await isPublicTablePresent(databaseUrl, "genre");

  if (isGenreTablePresent) {
    return;
  }

  const migrationDirectories = await listMigrationDirectories(PRISMA_MIGRATIONS_DIRECTORY_PATH);

  if (migrationDirectories.length === 0) {
    throw new Error("No Prisma migration directories were found.");
  }

  console.log("Database schema missing. Applying Prisma SQL migrations in Docker...");
  await runPrismaMigrationSqlFiles(databaseUrl, migrationDirectories);
};

const runSqlFiles = async (databaseUrl: string, filePaths: string[]): Promise<void> => {
  const sqlFileNames: string[] = filePaths.map((filePath) => basename(filePath));
  await runSeedSqlFiles(databaseUrl, sqlFileNames);
};

const runSeed = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }

  const sqlFiles = await listSqlFiles(SQL_DIRECTORY_PATH);

  if (sqlFiles.length === 0) {
    console.log("No SQL scripts found in seed/sql.");
    return;
  }

  console.log("Running seed scripts:");
  for (const sqlFile of sqlFiles) {
    const fileName = basename(sqlFile);
    console.log(`- ${fileName}`);
  }

  await ensureDatabaseSchema(databaseUrl);
  await runSqlFiles(databaseUrl, sqlFiles);

  console.log("Seed scripts executed successfully.");
};

await runSeed();
