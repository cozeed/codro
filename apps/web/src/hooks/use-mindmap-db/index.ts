import { useContext } from "react";
import { MindmapDb } from "@/db/mindmap-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let mindmapDb: MindmapDb | null = null;
export const getMindmapDb = (client: PGliteClient, userId: string): MindmapDb => {
  if (!mindmapDb) {
    mindmapDb = new MindmapDb(client);
  }
  mindmapDb.setUserId(userId);
  return mindmapDb;
};

export function useMindmapDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getMindmapDb(client, userId);
}
