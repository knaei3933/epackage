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
    // Ignore scripts and config files that use require()
    "scripts/**",
    "*.js",
    "!**/__tests__/**/*.js",
    "!jest.setup.js",
    "jest.polyfill.js",
    // Ignore server files (separate Express server)
    "server/**",
  ]),
]);

export default eslintConfig;
