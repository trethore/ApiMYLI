import { resolve } from "node:path";
import { $ } from "bun";

const DOCKER_COMPOSE_FILE_PATH = resolve(import.meta.dir, "../../../docker-compose.yml");
const POSTGRES_SERVICE_NAME = "postgres";
const DOCKER_POSTGRES_HOST = "127.0.0.1";
const DOCKER_POSTGRES_PORT = "5432";
const CONTAINER_SEED_WORKSPACE_PATH = "/workspace";

const toDockerDatabaseUrl = (databaseUrl: string): string => {
  const parsedDatabaseUrl = new URL(databaseUrl);

  if (parsedDatabaseUrl.protocol !== "postgresql:" && parsedDatabaseUrl.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must use the postgres protocol.");
  }

  parsedDatabaseUrl.hostname = DOCKER_POSTGRES_HOST;
  parsedDatabaseUrl.port = DOCKER_POSTGRES_PORT;

  return parsedDatabaseUrl.toString();
};

const runPsqlArguments = async (
  databaseUrl: string,
  psqlArguments: string[],
  containerWorkingDirectoryPath?: string,
): Promise<void> => {
  const dockerDatabaseUrl = toDockerDatabaseUrl(databaseUrl);

  const dockerComposeArguments: string[] = ["exec", "-T"];

  if (containerWorkingDirectoryPath !== undefined) {
    dockerComposeArguments.push("-w", containerWorkingDirectoryPath);
  }

  dockerComposeArguments.push(POSTGRES_SERVICE_NAME, "psql", dockerDatabaseUrl, "-v", "ON_ERROR_STOP=1");

  await $`docker compose -f ${DOCKER_COMPOSE_FILE_PATH} ${dockerComposeArguments} ${psqlArguments}`;
};

const readPsqlOutput = async (
  databaseUrl: string,
  psqlArguments: string[],
  containerWorkingDirectoryPath?: string,
): Promise<string> => {
  const dockerDatabaseUrl = toDockerDatabaseUrl(databaseUrl);

  const dockerComposeArguments: string[] = ["exec", "-T"];

  if (containerWorkingDirectoryPath !== undefined) {
    dockerComposeArguments.push("-w", containerWorkingDirectoryPath);
  }

  dockerComposeArguments.push(POSTGRES_SERVICE_NAME, "psql", dockerDatabaseUrl, "-v", "ON_ERROR_STOP=1");

  return await $`docker compose -f ${DOCKER_COMPOSE_FILE_PATH} ${dockerComposeArguments} ${psqlArguments}`.quiet().text();
};

export const isPublicTablePresent = async (databaseUrl: string, tableName: string): Promise<boolean> => {
  const escapedTableName = tableName.replaceAll('"', '""');
  const existenceQuery = `SELECT to_regclass('public."${escapedTableName}"') IS NOT NULL;`;
  const output = await readPsqlOutput(databaseUrl, ["-tA", "-c", existenceQuery]);

  return output.trim() === "t";
};

export const runSeedSqlFiles = async (databaseUrl: string, sqlFileNames: string[]): Promise<void> => {
  const sqlFileArguments: string[] = sqlFileNames.flatMap((sqlFileName) => [
    "-f",
    `${CONTAINER_SEED_WORKSPACE_PATH}/seed/sql/${sqlFileName}`,
  ]);

  await runPsqlArguments(databaseUrl, sqlFileArguments, CONTAINER_SEED_WORKSPACE_PATH);
};

export const runPrismaMigrationSqlFiles = async (
  databaseUrl: string,
  migrationDirectoryNames: string[],
): Promise<void> => {
  const migrationSqlArguments: string[] = migrationDirectoryNames.flatMap((migrationDirectoryName) => [
    "-f",
    `${CONTAINER_SEED_WORKSPACE_PATH}/prisma/migrations/${migrationDirectoryName}/migration.sql`,
  ]);

  await runPsqlArguments(databaseUrl, migrationSqlArguments, CONTAINER_SEED_WORKSPACE_PATH);
};

export const runSqlCommand = async (databaseUrl: string, sqlCommand: string): Promise<void> => {
  await runPsqlArguments(databaseUrl, ["-c", sqlCommand]);
};
