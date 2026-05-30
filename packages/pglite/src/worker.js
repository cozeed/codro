// Polyfill process for browser worker context (pglite Emscripten runtime references process.argv etc.)
globalThis.process ??= /** @type {any} */ ({ env: {}, argv: [], versions: {} });

import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { worker } from "@electric-sql/pglite/worker";

// import { migrate } from './migrations';

worker({
  async init(options) {
    // Create PGlite instance with Electric sync extension
    const pg = new PGlite({
      ...options,
      extensions: {
        ...options.extensions,
        live, // Load the live extension (this is the effective configuration)
      },
    });
    // const pg = new PGlite('idb://my-database')

    // Initialize database with proper Drizzle migrations and sync
    // await migrate(pg);

    return pg;
  },
});
