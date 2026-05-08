import type { FileDataItem, NewFileData } from "@workspace/db/schema";
import { identifier } from "@workspace/pglite";
import type { PGliteClient } from "@workspace/pglite";

/**
 * BaseDb
 */
export class BaseDb {
  protected userId: string = "";
  protected cache = new Map<string, FileDataItem["data"]>();

  constructor(
    protected client: PGliteClient,
    protected tableName: string = "file_data",
  ) {}

  public setUserId(userId: string) {
    this.userId = userId;
  }
  public setCache(id: string, data: FileDataItem["data"]) {
    this.cache.set(id, data);
  }

  public getCache(id: string): FileDataItem["data"] | undefined {
    return this.cache.get(id);
  }

  public deleteCache(id: string) {
    this.cache.delete(id);
  }

  async add(item: NewFileData) {
    const result = await this.client.sql`
    		INSERT INTO ${identifier`${this.tableName}`} 
			(id, type, data, user_id, created_at, updated_at)
			VALUES (
				${item.id},
				${item.type},
				${item.data},
				${item.userId},
				COALESCE(${item.createdAt}, NOW()),
				COALESCE(${item.updatedAt}, NOW())
				)
			RETURNING *;
		`;

    const row = (result.rows as unknown as FileDataItem[])[0];
    if (row) this.setCache(row.id, row.data);
    return row;
  }

  async update(id: string, data: Partial<Omit<FileDataItem, "createdAt" | "updatedAt">>) {
    const now = new Date();
    const { data: jsonData } = data;
    const result = await this.client.sql`
			UPDATE ${identifier`${this.tableName}`}
			SET data = ${jsonData}, updated_at = ${now}
			WHERE id = ${id}
			RETURNING *;
		`;
    const row = (result.rows as unknown as FileDataItem[])[0];
    if (row) this.setCache(id, row.data);
    return row;
  }

  async addOrUpdate(id: string, data: Partial<Omit<FileDataItem, "createdAt" | "updatedAt">>) {
    const now = new Date();
    const { type, data: jsonData, userId } = data;
    if (!type || !jsonData) throw new Error("Missing required fields 'type' or 'data'");

    const result = await this.client.sql`
			INSERT INTO ${identifier`${this.tableName}`} (id, type, data, user_id)
			VALUES (${id}, ${type}, ${jsonData}, ${userId ?? ""})
			ON CONFLICT (id) DO UPDATE
				SET type = EXCLUDED.type,
					data = EXCLUDED.data,
					user_id = EXCLUDED.user_id,
					updated_at = ${now}
			RETURNING *;
		`;
    const row = (result.rows as unknown as FileDataItem[])[0];
    if (row) this.setCache(id, row.data);
    return row;
  }

  async get(id: string) {
    const cachedData = this.getCache(id);
    if (cachedData) return { id, data: cachedData } as FileDataItem;

    const result = await this.client.sql`
			SELECT * FROM ${identifier`${this.tableName}`} WHERE id = ${id} LIMIT 1
		`;
    const row = (result.rows as unknown as FileDataItem[])[0];
    if (row) this.setCache(row.id, row.data);
    return row;
  }

  async getAllIds(): Promise<string[]> {
    const result = await this.client.sql`
      SELECT id FROM ${identifier`${this.tableName}`}
      WHERE deleted = false
    `;
    return result.rows.map((r: any) => r.id);
  }

  async delete(ids: string | string[]) {
    const idList = Array.isArray(ids) ? ids : [ids];
    await this.client.sql`
			DELETE FROM ${identifier`${this.tableName}`} WHERE id = ANY(${idList})
		`;
    idList.forEach((id) => this.cache.delete(id));
  }
}
