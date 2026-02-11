import { join } from "node:path";

const SQL_DIRECTORY = join(import.meta.dir, "sql");
const sqlTemplateCache = new Map<string, string>();

export async function loadSqlTemplate(fileName: string): Promise<string> {
  const cachedTemplate = sqlTemplateCache.get(fileName);
  if (cachedTemplate !== undefined) {
    return cachedTemplate;
  }

  const filePath = join(SQL_DIRECTORY, fileName);
  const template = await Bun.file(filePath).text();
  if (template.trim().length === 0) {
    throw new Error(`SQL template is empty: ${filePath}`);
  }

  sqlTemplateCache.set(fileName, template);
  return template;
}
