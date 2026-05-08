import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useNoteDb } from "@/hooks/use-note-db";

export function useNoteQuery(id: string) {
  const { status } = useContext(DBContext);
  const noteDb = useNoteDb();

  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(
    `SELECT id, type, data FROM file_data WHERE id = $1 LIMIT 1`,
    [id],
    "id",
  );

  const rowData = result?.rows?.[0]?.data;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!noteDb || !rowData) return;

    noteDb.setCache(id, rowData);
  }, [rowData, noteDb, id]);

  // 3️⃣ single source of truth (derived state)
  const noteData = useMemo(() => {
    if (!noteDb) return null;

    const cached = noteDb.getCache(id);

    return rowData ?? cached ?? null;
  }, [noteDb, id, rowData]);

  return {
    noteData,
    isReading: status !== DBStatus.Ready || !noteData,
  };
}
