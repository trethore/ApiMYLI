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

const runSqlFile = async (databaseUrl: string, filePath: string): Promise<void> => {
  await $`psql ${databaseUrl} -v ON_ERROR_STOP=1 -f ${filePath}`;
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

  for (const sqlFile of sqlFiles) {
    const fileName = basename(sqlFile);
    console.log(`Running ${fileName}...`);
    await runSqlFile(databaseUrl, sqlFile);
  }

  console.log("Seed scripts executed successfully.");
};

await runSeed();
