import i18n from "i18next";
import type { NewFileData } from "@workspace/db/schema";

import { BaseDb } from "./base-db";

export class MindmapDb extends BaseDb {
  async addMind(id: string, mindData: Record<string, unknown> = {}) {
    const MIND_INITIAL_DATA: Record<string, unknown> = {
      root: {
        data: {
          text: i18n.t("operation.mindCentralTopic"),
        },
        children: [],
      },
      view: null,
    };

    const newMind: NewFileData = {
      id,
      type: "mindmap",
      data: Object.keys(mindData).length > 0 ? mindData : MIND_INITIAL_DATA,
      userId: this.userId,
    };

    await super.add(newMind);
  }

  async updateMind(id: string, mindData: Record<string, unknown>) {
    // console.time(`💾 DB UpdateMind [${id}]`);
    await super.update(id, { data: mindData });
    // console.timeEnd(`💾 DB UpdateMind [${id}]`);
  }

  async getMind(id: string): Promise<Record<string, unknown>> {
    // console.time(`💾 DB GetMind [${id}]`);
    const record = await super.get(id);
    // console.timeEnd(`💾 DB GetMind [${id}]`);
    return record?.data as Record<string, unknown>;
  }

  async getAllMindIds(): Promise<string[]> {
    return super.getAllIds();
  }

  async deleteMind(id: string) {
    await super.delete(id);
  }
}
