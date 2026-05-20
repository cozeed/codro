import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useFileDb } from "@/hooks/use-file-db";

export function useFileQuery(id: string) {
  const { status } = useContext(DBContext);
  const fileDb = useFileDb();
  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(
    `SELECT id, type, data FROM file_data WHERE id = $1 LIMIT 1`,
    [id],
    "id",
  );

  const rowData = result?.rows?.[0]?.data;
  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!fileDb || !rowData) return;
    fileDb.setCache(id, rowData);
  }, [rowData, fileDb, id]);
  // 3️⃣ single source of truth (derived state)
  const fileData = useMemo(() => {
    if (!fileDb) return null;
    return rowData ?? fileDb.getCache(id) ?? null;
  }, [fileDb, id, rowData]);

  return {
    fileData,
    isReading: status !== DBStatus.Ready || !fileData,
  };
}
