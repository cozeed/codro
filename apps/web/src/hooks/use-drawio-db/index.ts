import { useContext } from "react";
import { DrawioDb } from "@/db/drawio-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let drawioDb: DrawioDb | null = null;
export const getDrawioDb = (client: PGliteClient, userId: string): DrawioDb => {
  if (!drawioDb) {
    drawioDb = new DrawioDb(client);
  }
  drawioDb.setUserId(userId);
  return drawioDb;
};

export function useDrawioDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getDrawioDb(client, userId);
}
