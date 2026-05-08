import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";
import type { NewFileData } from "@workspace/db/schema";

import { BaseDb } from "./base-db";

export class BoardDb extends BaseDb {
  async addBoard(id: string, boardData?: ExcalidrawInitialDataState) {
    const newBoard: NewFileData = {
      id,
      type: "board",
      data: boardData ?? {},
      userId: this.userId,
    };
    return super.add(newBoard);
  }
  async updateBoard(id: string, boardData: ExcalidrawInitialDataState) {
    // console.time(`💾 DB UpdateBoard [${id}]`);
    const result = await super.update(id, { data: boardData });
    // console.timeEnd(`💾 DB UpdateBoard [${id}]`);
    return result;
  }

  async getBoard(id: string): Promise<ExcalidrawInitialDataState> {
    // console.time(`💾 DB GetBoard [${id}]`);
    const record = await super.get(id);
    // console.timeEnd(`💾 DB GetBoard [${id}]`);
    return record?.data as ExcalidrawInitialDataState;
  }

  async getAllBoardIds(): Promise<string[]> {
    return super.getAllIds();
  }

  async deleteBoard(id: string | string[]) {
    await super.delete(id);
  }
}
