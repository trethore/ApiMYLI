export function toSqlLiteral(value: string): string {
  const escapedValue = value.replaceAll("'", "''");
  return `'${escapedValue}'`;
}

export function quoteIdentifier(value: string): string {
  const escapedValue = value.replaceAll('"', '""');
  return `"${escapedValue}"`;
}

export function normalizeTemporalFeatureColumn(columnName: string): string {
  return columnName.replaceAll(".", "");
}

export function applySqlTemplate(template: string, replacements: Record<string, string>): string {
  let renderedTemplate = template;

  for (const [key, value] of Object.entries(replacements)) {
    renderedTemplate = renderedTemplate.replaceAll(`__${key}__`, value);
  }

  const unresolvedPlaceholders = renderedTemplate.match(/__[A-Z0-9_]+__/g);
  if (unresolvedPlaceholders !== null && unresolvedPlaceholders.length > 0) {
    throw new Error(`Unresolved SQL placeholders: ${unresolvedPlaceholders.join(", ")}`);
  }

  return renderedTemplate;
}
