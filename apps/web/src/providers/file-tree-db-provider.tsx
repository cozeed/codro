"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { CoFileTree } from "@/types/file";
import type { FileDataItem } from "@workspace/db/schema";
import { useLiveIncrementalQuery } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useFileTreeDb } from "@/hooks/use-file-tree-db";

export interface FileTreeDBContextValue {
  fileTreeData: CoFileTree;
  isReading: boolean;
}

export const FileTreeDBContext = createContext<FileTreeDBContextValue>({
  fileTreeData: {},
  isReading: true,
});

interface FileTreeDBProviderProps {
  children: ReactNode;
  id: string;
}

export function FileTreeDBProvider({ id, children }: FileTreeDBProviderProps) {
  const { status } = useContext(DBContext);
  const fileTreeDb = useFileTreeDb();

  // initialize file tree
  useEffect(() => {
    if (!fileTreeDb || status !== DBStatus.Ready) return;
    fileTreeDb.initFileTree();
  }, [fileTreeDb, status]);
  // 1️⃣ subscribe db change
  const result = useLiveIncrementalQuery<FileDataItem>(
    `SELECT id, type, data FROM file_data WHERE id = $1 LIMIT 1`,
    [id],
    "id",
  );

  const rowData = result?.rows?.[0]?.data as CoFileTree | undefined;

  // 2️⃣ cache sync (side effect only)
  useEffect(() => {
    if (!fileTreeDb || !rowData) return;
    fileTreeDb.setCache(id, rowData);
  }, [rowData, fileTreeDb, id]);

  // 3️⃣ single source of truth
  const fileTreeData = useMemo(() => {
    if (!fileTreeDb) return null;
    const cached = fileTreeDb.getCache(id);

    return rowData ?? (cached as CoFileTree | undefined) ?? null;
  }, [fileTreeDb, id, rowData]);

  return (
    <FileTreeDBContext.Provider
      value={{
        fileTreeData: fileTreeData ?? {},
        isReading: status !== DBStatus.Ready,
      }}
    >
      {children}
    </FileTreeDBContext.Provider>
  );
}
