import { loadSqlTemplate } from "./sql-loader";

export async function buildSettingsAndHelpersSql(): Promise<string> {
  return loadSqlTemplate("settings-helpers.sql");
}
