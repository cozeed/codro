import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { type NodePgDatabase, drizzle as pgDrizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export interface DatabaseClientOptions {
  databaseUrl?: string;
  max?: number;
}

export type DatabaseInstance = NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

export const createDb = (opts?: DatabaseClientOptions): DatabaseInstance => {
  const url = opts?.databaseUrl;
  if (!url) {
    throw new Error("Database URL is required");
  }
  const isNeonDB = url.includes(".neon.tech") || url.includes("pooler.supabase.com");
  if (isNeonDB) {
    return neonDrizzle(neon(url), { schema, casing: "snake_case" });
  }

  return pgDrizzle({
    schema,
    casing: "snake_case",
    connection: {
      connectionString: url,
      max: opts?.max,
    },
  });
};
