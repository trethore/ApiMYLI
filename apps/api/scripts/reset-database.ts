import "dotenv/config";
import { runSqlCommand } from "./run-psql";

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
  await runSqlCommand(databaseUrl, RESET_SCHEMA_SQL);
  console.log("Database schema reset completed.");
};

await resetDatabase();
