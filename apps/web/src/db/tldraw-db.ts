import type { TLEditorSnapshot, TLPageId } from "tldraw";
import type { NewFileData } from "@workspace/db/schema";

import { BaseDb } from "./base-db";

const TLDRAW_INITIAL_DATA: TLEditorSnapshot = {
  document: {
    store: {},
    schema: {
      schemaVersion: 2,
      sequences: {},
    },
  },
  session: {
    version: 0,
    currentPageId: "page:page" as TLPageId,
  },
};

export class TldrawDb extends BaseDb {
  async addTldraw(id: string, tldrawData: TLEditorSnapshot = TLDRAW_INITIAL_DATA) {
    const newTldraw: NewFileData = {
      id,
      type: "tldraw",
      data: tldrawData,
      userId: this.userId,
    };
    await super.add(newTldraw);
  }

  async updateTldraw(id: string, tldrawData: TLEditorSnapshot) {
    // console.time(`💾 DB UpdateTldraw [${id}]`);
    await super.update(id, { data: tldrawData });
    // console.timeEnd(`💾 DB UpdateTldraw [${id}]`);
  }

  async getTldraw(id: string): Promise<TLEditorSnapshot> {
    // console.time(`💾 DB GetTldraw [${id}]`);
    const record = await super.get(id);
    // console.timeEnd(`💾 DB GetTldraw [${id}]`);
    return record?.data as TLEditorSnapshot;
  }

  async getAllTldrawIds(): Promise<string[]> {
    return super.getAllIds();
  }

  async deleteTldraw(id: string) {
    await super.delete(id);
  }
}
