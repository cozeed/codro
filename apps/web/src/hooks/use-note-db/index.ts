import { useContext } from "react";
import { NoteDb } from "@/db/note-db";
import type { PGliteClient } from "@workspace/pglite";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { useAuth } from "@/hooks/use-auth";

let noteDb: NoteDb | null = null;
export const getNoteDb = (client: PGliteClient, userId: string): NoteDb => {
  if (!noteDb) {
    noteDb = new NoteDb(client);
  }
  noteDb.setUserId(userId);
  return noteDb;
};

export function useNoteDb() {
  const { userId } = useAuth();
  const { client, status } = useContext(DBContext);

  if (!client || status !== DBStatus.Ready || !userId) {
    return null;
  }

  return getNoteDb(client, userId);
}
