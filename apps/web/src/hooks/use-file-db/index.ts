import { useContext } from "react";
import { BaseDb } from "@/db/base-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let fileDb: BaseDb | null = null;

export const getFileDb = (client: PGliteClient, userId: string): BaseDb => {
  if (!fileDb) {
    fileDb = new BaseDb(client);
  }
  fileDb.setUserId(userId);
  return fileDb;
};

export function useFileDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getFileDb(client, userId);
}
