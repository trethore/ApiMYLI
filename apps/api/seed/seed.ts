import { readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { $ } from "bun";
import "dotenv/config";

const SQL_DIRECTORY_PATH = resolve(import.meta.dir, "sql");

const listSqlFiles = async (sqlDirectoryPath: string): Promise<string[]> => {
  const entries = await readdir(sqlDirectoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => resolve(sqlDirectoryPath, entry.name))
    .sort((leftPath, rightPath) => basename(leftPath).localeCompare(basename(rightPath)));
};

const runSqlFiles = async (databaseUrl: string, filePaths: string[]): Promise<void> => {
  const fileArguments: string[] = filePaths.flatMap((filePath) => ["-f", filePath]);
  await $`psql ${databaseUrl} -v ON_ERROR_STOP=1 ${fileArguments}`;
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

  await runSqlFiles(databaseUrl, sqlFiles);

  console.log("Seed scripts executed successfully.");
};

await runSeed();
