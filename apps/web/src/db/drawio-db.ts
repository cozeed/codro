import type { NewFileData } from "@workspace/db/schema";

import { BaseDb } from "./base-db";

export class DrawioDb extends BaseDb {
  async addDrawio(id: string, drawioData: string = "") {
    const newDrawio: NewFileData = {
      id,
      type: "drawio",
      data: { xml: drawioData },
      userId: this.userId,
    };
    await super.add(newDrawio);
  }

  async updateDrawio(id: string, drawioData: string) {
    await super.update(id, { data: { xml: drawioData } });
  }

  async getDrawio(id: string): Promise<string> {
    // console.time(`💾 DB GetDrawio [${id}]`);
    const record = await super.get(id);
    // console.timeEnd(`💾 DB GetDrawio [${id}]`);
    return (record?.data as Record<string, unknown>)?.xml as string;
  }

  async getAllDrawioIds(): Promise<string[]> {
    return super.getAllIds();
  }

  async deleteDrawio(id: string) {
    await super.delete(id);
  }
}
