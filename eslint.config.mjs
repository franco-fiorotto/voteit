import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // We deliberately use TypeScript `namespace` to group typed use-case errors
    // (e.g. CreatePollErrors.InvalidPoll), mirroring the reference DDD
    // architecture. This is an intentional, scoped exception to the default.
    files: ["src/**/*Errors.ts", "src/shared/core/AppError.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
    },
  },
]);

export default eslintConfig;
