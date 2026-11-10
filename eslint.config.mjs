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
    // Build dirs for the e2e servers (see next.config.ts). Generated output,
    // same as .next — linting it buries every real finding.
    ".next-e2e/**",
    ".next-e2e-gate/**",
  ]),
]);

export default eslintConfig;
