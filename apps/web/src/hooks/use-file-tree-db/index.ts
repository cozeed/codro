import { useContext } from "react";
import { FileTreeDb } from "@/db/file-tree-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let fileTreeDb: FileTreeDb | null = null;
function getFileTreeDb(client: PGliteClient, userId: string): FileTreeDb {
  if (!fileTreeDb) {
    fileTreeDb = new FileTreeDb(client);
  }
  fileTreeDb.setUserId(userId);
  return fileTreeDb;
}

export function useFileTreeDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    // console.warn("useFileTreeDb: PGlite DB is not initialized yet.");
    return null;
  }

  return getFileTreeDb(client as PGliteClient, userId);
}
