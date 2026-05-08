import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useTldrawDb } from "@/hooks/use-tldraw-db";

export function useTldrawQuery(id: string) {
  const { status } = useContext(DBContext);
  const tldrawDb = useTldrawDb();

  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(`SELECT * FROM file_data WHERE id = $1 LIMIT 1`, [id], "id");

  const rowData = result?.rows?.[0]?.data;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!tldrawDb || !rowData) return;

    tldrawDb.setCache(id, rowData);
  }, [rowData, tldrawDb, id]);

  // 3️⃣ single source of truth (derived state)
  const tldrawData = useMemo(() => {
    if (!tldrawDb) return null;

    const cached = tldrawDb.getCache(id);

    return rowData ?? cached ?? null;
  }, [tldrawDb, id, rowData]);

  return {
    tldrawData,
    isReading: status !== DBStatus.Ready || !tldrawData,
  };
}
