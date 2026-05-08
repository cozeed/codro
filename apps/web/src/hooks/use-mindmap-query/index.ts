import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useMindmapDb } from "@/hooks/use-mindmap-db";

export function useMindmapQuery(id: string) {
  const { status } = useContext(DBContext);
  const mindmapDb = useMindmapDb();

  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(
    `SELECT id, type, data FROM file_data WHERE id = $1 LIMIT 1`,
    [id],
    "id",
  );

  const rowData = result?.rows?.[0]?.data;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!mindmapDb || !rowData) return;

    mindmapDb.setCache(id, rowData);
  }, [rowData, mindmapDb, id]);

  // 3️⃣ single source of truth (derived state)
  const mindmapData = useMemo(() => {
    if (!mindmapDb) return null;

    const cached = mindmapDb.getCache(id);

    return rowData ?? cached ?? null;
  }, [mindmapDb, id, rowData]);

  return {
    mindmapData,
    isReading: status !== DBStatus.Ready || !mindmapData,
  };
}
