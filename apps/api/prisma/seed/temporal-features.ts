import { loadSqlTemplate } from "./sql-loader";
import {
  applySqlTemplate,
  normalizeTemporalFeatureColumn,
  quoteIdentifier,
  toSqlLiteral,
} from "./sql-utils";

export async function buildTemporalFeaturesSql(
  featuresFilePath: string,
  csvColumns: string[],
): Promise<string> {
  if (!csvColumns.includes("track_id")) {
    throw new Error("clean_features.csv must include the track_id column.");
  }

  const sourceColumns = csvColumns.filter((columnName: string) => columnName !== "track_id");
  const stagingColumnDefinitions = csvColumns
    .map((columnName: string) => {
      const columnType = columnName === "track_id" ? "TEXT" : "DOUBLE PRECISION";
      return `${quoteIdentifier(columnName)} ${columnType}`;
    })
    .join(",\n  ");

  const baseReplacements: Record<string, string> = {
    STAGING_COLUMN_DEFINITIONS: stagingColumnDefinitions,
    FEATURES_CSV: toSqlLiteral(featuresFilePath),
  };

  if (sourceColumns.length === 0) {
    const template = await loadSqlTemplate("temporal-features-track-only.sql");
    return applySqlTemplate(template, baseReplacements);
  }

  const destinationColumns: string[] = [];
  const selectExpressions: string[] = [];
  const updateExpressions: string[] = [];
  const alterStatements: string[] = [];
  const seenDestinationColumns = new Set<string>();

  for (const sourceColumn of sourceColumns) {
    const destinationColumn = normalizeTemporalFeatureColumn(sourceColumn);
    if (seenDestinationColumns.has(destinationColumn)) {
      throw new Error(`Temporal feature column collision detected: ${destinationColumn}`);
    }

    seenDestinationColumns.add(destinationColumn);
    destinationColumns.push(quoteIdentifier(destinationColumn));
    selectExpressions.push(
      `s.${quoteIdentifier(sourceColumn)} AS ${quoteIdentifier(destinationColumn)}`,
    );
    updateExpressions.push(
      `${quoteIdentifier(destinationColumn)} = EXCLUDED.${quoteIdentifier(destinationColumn)}`,
    );
    alterStatements.push(
      `ALTER TABLE temporal_feature ADD COLUMN IF NOT EXISTS ${quoteIdentifier(destinationColumn)} DOUBLE PRECISION;`,
    );
  }

  const template = await loadSqlTemplate("temporal-features.sql");
  return applySqlTemplate(template, {
    ...baseReplacements,
    ALTER_TEMPORAL_COLUMNS: alterStatements.join("\n"),
    DESTINATION_COLUMNS: destinationColumns.join(", "),
    SELECT_EXPRESSIONS: selectExpressions.join(", "),
    UPDATE_EXPRESSIONS: updateExpressions.join(", "),
  });
}
