import baseConfig, { restrictEnvAccess } from "@workspace/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...restrictEnvAccess,
  {
    files: ["drizzle.config.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
];
