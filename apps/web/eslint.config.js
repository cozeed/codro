import { restrictEnvAccess } from "@workspace/eslint-config/base";
import reactConfig from "@workspace/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/target/**",
      "**/src-tauri/target/**",
      "**/*.generated.*",
    ],
  },
  ...reactConfig,
  ...restrictEnvAccess,
  {
    files: ["vite.config.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
];
