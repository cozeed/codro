import type { PGliteClient } from "./index";
import { api } from "./trpc-client";

interface FileDataChange {
  id: string;
  type?: string | null;
  data?: unknown | null;
  userId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  modifiedColumns?: string[] | null;
  isNew?: boolean | null;
  isDeleted?: boolean | null;
}

interface SyncableRow {
  id: string;
  type: string;
  data: unknown;
  created_at: Date;
  updated_at: Date;
  modified_columns: string[];
  new: boolean;
  deleted: boolean;
}

/**
 * Local ↔ Server
 */
export async function startSync(client: PGliteClient, userId: string) {
  if (!userId) {
    console.warn("⚠️ startSync: userId is required");
    return;
  }

  await client.query(`SELECT 1;`); // Ensure idle

  // Local → Server
  await pushLocalToServer(client, userId);

  // Server → Local
  await pullServerToLocal(client, userId);
}

/**
 * Server → Local
 */
async function pullServerToLocal(client: PGliteClient, userId: string) {
  // 1) get server full data
  const serverFiles = await api.fileDatas.all.query();
  // 2) batch write back to local db
  await client.transaction(async (tx) => {
    // Bypass triggers to avoid polluting diff data
    tx.exec("SET LOCAL electric.bypass_triggers = true");

    // upsert server
    for (const f of serverFiles) {
      await tx.query(
        `
        INSERT INTO file_data
          (id, type, data, user_id, created_at, updated_at,
           modified_columns, new, deleted, sent_to_server, backup)
        VALUES
          ($1, $2, $3, $4, $5, $6,
           ARRAY[]::TEXT[], false, $7, true, NULL)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          data = EXCLUDED.data,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          modified_columns = ARRAY[]::TEXT[],
          new = false,
          deleted = EXCLUDED.deleted,
          sent_to_server = true,
          backup = NULL
        `,
        [f.id, f.type, f.data, userId, f.createdAt, f.updatedAt, f.deleted],
      );
    }
    // Delete local files that are deleted and sent to server
    await tx.query(
      `
      DELETE FROM file_data
      WHERE deleted = true
        AND sent_to_server = true
        AND user_id = $1
      `,
      [userId],
    );
  });

  // console.log(`✅ server → local sync done`);
}

/**
 * Local → Server
 */
async function pushLocalToServer(client: PGliteClient, userId: string) {
  const fileChanges: FileDataChange[] = [];

  await client.transaction(async (tx) => {
    const res = await tx.query(
      `
      SELECT id, type, data, created_at, updated_at, modified_columns, new, deleted
      FROM file_data
      WHERE sent_to_server = false AND user_id = $1
      `,
      [userId],
    );

    fileChanges.push(
      ...(res.rows as SyncableRow[]).map((r) => ({
        id: r.id,
        type: r.type,
        data: r.data,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
        modifiedColumns: r.modified_columns,
        isNew: r.new,
        isDeleted: r.deleted,
        userId,
      })),
    );
  });

  if (fileChanges.length === 0) return;

  try {
    await api.fileDatas.applyChange.mutate({ files: fileChanges });
  } catch (err) {
    console.error("❌ Failed to apply changes to server", err);
    throw err;
  }

  // Mark as synced
  await client.transaction(async (tx) => {
    tx.exec("SET LOCAL electric.bypass_triggers = true");
    for (const f of fileChanges) {
      await tx.query(
        `
        UPDATE file_data
        SET sent_to_server = true,
            new = false,
            modified_columns = ARRAY[]::TEXT[],
            backup = NULL
        WHERE id = $1
        `,
        [f.id],
      );
    }
  });

  // console.log(`✅ local → server sync done`);
}
