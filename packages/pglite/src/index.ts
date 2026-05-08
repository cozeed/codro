import { PGlite as PGClient } from "@electric-sql/pglite";
import { live, type PGliteWithLive } from "@electric-sql/pglite/live";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { drizzle } from "drizzle-orm/pglite";

import { migrate } from "./migrations";
import * as schema from "./schema";

declare global {
  interface Window {
    client?: unknown;
    db?: unknown;
  }
}

export type PGliteClient = Awaited<ReturnType<typeof initializePGlite>>["client"];
export type PGliteDb = Awaited<ReturnType<typeof initializePGlite>>["db"];

/**
 * Initialize PGlite client
 */
export async function initializePGlite() {
  const useOPFS = window.isSecureContext;
  console.log("✅ use OPFS:", useOPFS);

  const tryOPFS = async () => {
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
      name: "pglite-worker",
    });
    const workerClient = await PGliteWorker.create(worker, {
      debug: 0,
      relaxedDurability: true,
      dataDir: "opfs-ahp://pglite-db",
      initialMemory: 256 * 1024 * 1024,
      extensions: { live },
    });
    await workerClient.waitReady;
    return workerClient;
  };

  const createIDB = async () => {
    const baseClient = await PGClient.create({
      debug: 0,
      relaxedDurability: true,
      dataDir: "idb://pglite-db",
      initialMemory: 256 * 1024 * 1024,
      extensions: { live },
    });
    await baseClient.waitReady;
    return baseClient;
  };

  let client: PGliteWithLive;
  if (useOPFS) {
    try {
      client = await tryOPFS();
    } catch {
      console.warn("OPFS init failed, falling back to IDB");
      client = await createIDB();
    }
  } else {
    client = await createIDB();
  }

  // Apply migrations
  await migrate(client as unknown as PGClient);
  // Create Drizzle instance with the worker
  const db = drizzle(client as unknown as PGClient, { schema });
  // Expose client and db for debug, eg. input in browser console
  // await client.query(`SELECT * FROM file_data`)
  window.client = client;
  window.db = db;

  return { client, db };
}

export { usePGlite } from "./hooks";
export { migrate } from "./migrations";
export { DBProvider } from "./provider";
export { identifier } from "@electric-sql/pglite/template";
export { useLiveQuery, useLiveIncrementalQuery } from "@electric-sql/pglite-react";
export * as schema from "./schema";
