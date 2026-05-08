import { camelCase } from "es-toolkit";
import * as v from "valibot";
import { eq, sql } from "@workspace/db";
import type { DatabaseInstance } from "@workspace/db/client";
import { fileDataTable, type FileDataItem, type NewFileData } from "@workspace/db/schema";

export const fileDataChangeSchema = v.object({
  id: v.string(),
  type: v.optional(v.nullable(v.string())),
  data: v.optional(v.nullable(v.any())),
  userId: v.optional(v.nullable(v.string())),
  createdAt: v.optional(v.nullable(v.string())),
  updatedAt: v.optional(v.nullable(v.string())),
  modifiedColumns: v.optional(v.nullable(v.array(v.string()))),
  isNew: v.optional(v.nullable(v.boolean())),
  isDeleted: v.optional(v.nullable(v.boolean())),
});

export type FileDataChange = v.InferInput<typeof fileDataChangeSchema>;

export class FileDataService {
  constructor(
    private db: DatabaseInstance,
    private userId: string,
  ) {}

  async applyChange(change: FileDataChange) {
    const { id, type, data, modifiedColumns, createdAt, updatedAt, isNew, isDeleted } = change;

    if (modifiedColumns && modifiedColumns.length > 0) {
      const modifiedData: Record<string, unknown> = {};
      for (const col of modifiedColumns) {
        const camelCol = camelCase(col);
        if (camelCol === "new") {
          modifiedData[camelCol] = isNew;
        } else if (camelCol === "deleted") {
          modifiedData[camelCol] = isDeleted;
        } else if (camelCol === "createdAt" && typeof createdAt === "string") {
          modifiedData[camelCol] = new Date(createdAt);
        } else if (camelCol === "updatedAt" && typeof updatedAt === "string") {
          modifiedData[camelCol] = new Date(updatedAt);
        } else if (camelCol in change) {
          modifiedData[camelCol] = change[camelCol as keyof FileDataChange];
        }
      }

      const insertData: NewFileData = { id, type: type || "", data, userId: this.userId, ...modifiedData };
      const updateData: Partial<FileDataItem> = { ...modifiedData };

      await this.db
        .insert(fileDataTable)
        .values(insertData)
        .onConflictDoUpdate({
          target: fileDataTable.id,
          set: updateData,
          where: sql`excluded.updated_at > file_data.updated_at`,
        });
    }
  }

  async getAll(): Promise<FileDataItem[]> {
    return this.db.select().from(fileDataTable).where(eq(fileDataTable.userId, this.userId));
  }

  async getOne(id: string): Promise<FileDataItem | null> {
    const result = await this.db.select().from(fileDataTable).where(eq(fileDataTable.id, id)).limit(1);

    return result.length > 0 ? (result[0] as FileDataItem) : null;
  }
}
