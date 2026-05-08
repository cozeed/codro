import { useContext } from "react";
import { BoardDb } from "@/db/board-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let boardDb: BoardDb | null = null;
export const getBoardDb = (client: PGliteClient, userId: string): BoardDb => {
  if (!boardDb) {
    boardDb = new BoardDb(client);
  }
  boardDb.setUserId(userId);
  return boardDb;
};

export function useBoardDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getBoardDb(client, userId);
}
