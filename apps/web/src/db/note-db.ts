import type { PartialBlock } from "@blocknote/core";
import type { NewFileData } from "@workspace/db/schema";

import { BaseDb } from "./base-db";

export const BLOCKNOTE_INITIAL_DATA: PartialBlock[] = [
  {
    type: "paragraph",
    content: "",
  },
];

export class NoteDb extends BaseDb {
  async addNote(id: string, noteData: PartialBlock[] = BLOCKNOTE_INITIAL_DATA) {
    const newNote: NewFileData = {
      id,
      type: "note",
      data: noteData,
      userId: this.userId,
    };
    await super.add(newNote);
  }

  async updateNote(id: string, noteData: PartialBlock[]) {
    // console.time(`💾 DB UpdateNote [${id}]`);
    await super.update(id, { data: noteData });
    // console.timeEnd(`💾 DB UpdateNote [${id}]`);
  }

  async getNote(id: string): Promise<PartialBlock[]> {
    // console.time(`💾 DB ReadNote [${id}]`);
    const record = await super.get(id);
    // console.timeEnd(`💾 DB ReadNote [${id}]`);
    return record?.data as PartialBlock[];
  }

  async getAllNoteIds(): Promise<string[]> {
    return super.getAllIds();
  }

  async deleteNote(id: string) {
    await super.delete(id);
  }
}
