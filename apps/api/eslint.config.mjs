import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["prisma/generated/**", "schema.gql", "data/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  prettierConfig,

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
        Bun: "readonly",
      },
    },
  },
];
