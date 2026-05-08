import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useDrawioDb } from "@/hooks/use-drawio-db";

export function useDrawioQuery(id: string) {
  const { status } = useContext(DBContext);
  const drawioDb = useDrawioDb();

  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(
    `SELECT id, type, data FROM file_data WHERE id = $1 LIMIT 1`,
    [id],
    "id",
  );

  const rowData = result?.rows?.[0]?.data;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!drawioDb || !rowData) return;

    drawioDb.setCache(id, rowData);
  }, [rowData, drawioDb, id]);

  // 3️⃣ single source of truth (derived state)
  const drawioData = useMemo(() => {
    if (!drawioDb) return null;

    const cached = drawioDb.getCache(id);

    return rowData ?? cached ?? null;
  }, [drawioDb, id, rowData]);

  return {
    drawioData,
    isReading: status !== DBStatus.Ready || !drawioData,
  };
}
