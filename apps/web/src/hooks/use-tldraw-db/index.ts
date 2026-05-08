import { useContext } from "react";
import { TldrawDb } from "@/db/tldraw-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let tldrawDb: TldrawDb | null = null;
export const getTldrawDb = (client: PGliteClient, userId: string): TldrawDb => {
  if (!tldrawDb) {
    tldrawDb = new TldrawDb(client);
  }
  tldrawDb.setUserId(userId);
  return tldrawDb;
};

export function useTldrawDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getTldrawDb(client, userId);
}
