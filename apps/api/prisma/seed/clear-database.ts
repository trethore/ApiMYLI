import { loadSqlTemplate } from "./sql-loader";

export async function buildClearDatabaseSql(): Promise<string> {
  return loadSqlTemplate("clear-database.sql");
}
