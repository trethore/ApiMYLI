import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { printSchema } from "graphql";
import { schema } from "@/presentation/schema";

const outputPath = resolve(import.meta.dir, "../../schema.gql");
const schemaContent = printSchema(schema);

await writeFile(outputPath, `${schemaContent}\n`, "utf-8");

console.log("Generated apps/api/schema.gql");
