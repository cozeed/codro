import { useContext, useEffect, useMemo } from "react";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useBoardDb } from "@/hooks/use-board-db";

export function useBoardQuery(id: string) {
  const { status } = useContext(DBContext);
  const boardDb = useBoardDb();

  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(`SELECT * FROM file_data WHERE id = $1 LIMIT 1`, [id], "id");

  const rowData = result?.rows?.[0]?.data;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!boardDb || !rowData) return;

    boardDb.setCache(id, rowData);
  }, [rowData, boardDb, id]);

  // 3️⃣ single source of truth (derived state)
  const boardData = useMemo(() => {
    if (!boardDb) return null;

    const cached = boardDb.getCache(id);

    return rowData ?? cached ?? null;
  }, [boardDb, id, rowData]);

  return {
    boardData,
    isReading: status !== DBStatus.Ready || !boardData,
  };
}
