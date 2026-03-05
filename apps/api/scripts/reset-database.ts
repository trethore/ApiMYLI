import { $ } from "bun";
import "dotenv/config";

const RESET_SCHEMA_SQL = `
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
`;

const resetDatabase = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required to reset the database.");
  }

  console.log("Resetting database schema...");
  await $`psql ${databaseUrl} -v ON_ERROR_STOP=1 -c ${RESET_SCHEMA_SQL}`;
  console.log("Database schema reset completed.");
};

await resetDatabase();
