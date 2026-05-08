import type { PGlite } from "@electric-sql/pglite";

import m1 from "../migrations-client/01-create_tables.sql?raw";

export async function migrate(pg: PGlite) {
  const tables = await pg.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
  if (tables.rows.length === 0) {
    await pg.exec(m1);
  }
}
