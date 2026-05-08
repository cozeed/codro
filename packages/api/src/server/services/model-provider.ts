import { and, asc, eq, sql } from "@workspace/db";
import type { DatabaseInstance } from "@workspace/db/client";
import { modelProviderTable, userTable, type ModelProviderItem, type NewModelProvider } from "@workspace/db/schema";
import { initModelProviders } from "@workspace/db/utils";

import { decrypt, encrypt } from "../utils/encrypt";

export class ModelProviderService {
  constructor(
    private db: DatabaseInstance,
    private userId: string,
  ) {
    this.db = db;
    this.userId = userId;
  }

  // get all model providers by user
  async getAllByUser(): Promise<ModelProviderItem[]> {
    const rows = await this.db.query.modelProviderTable.findMany({
      where: eq(modelProviderTable.createdBy, this.userId),
      orderBy: asc(modelProviderTable.sort),
    });

    return rows.map((row) => ({
      ...row,
      apiKey: row.apiKey ? decrypt(row.apiKey) : null,
    }));
  }

  // get model provider by id
  async getOne(id: string) {
    const [row] = await this.db
      .select({
        id: modelProviderTable.id,
        name: modelProviderTable.name,
        baseUrl: modelProviderTable.baseUrl,
        models: modelProviderTable.models,
        apiKey: modelProviderTable.apiKey,
        sort: modelProviderTable.sort,
        createdAt: modelProviderTable.createdAt,
        updatedAt: modelProviderTable.updatedAt,
        owner: { id: userTable.id, name: userTable.name },
      })
      .from(modelProviderTable)
      .innerJoin(userTable, eq(modelProviderTable.createdBy, userTable.id))
      .where(eq(modelProviderTable.id, id));
    if (!row) return null;

    return {
      ...row,
      apiKey: row.apiKey ? decrypt(row.apiKey) : null,
    };
  }
  // get model provider by model name(gpt-4)
  async getByModelName(modelName: string): Promise<ModelProviderItem | null> {
    const all = await this.getAllByUser();
    return (
      all.find((item) =>
        item.models
          .split(",")
          .map((m) => m.trim())
          .includes(modelName),
      ) ?? null
    );
  }
  // create model provider
  async create(
    data: Omit<NewModelProvider, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">,
  ): Promise<any> {
    const maxSortResult = await this.db
      .select({ max: sql<number>`max(${modelProviderTable.sort})` })
      .from(modelProviderTable)
      .where(eq(modelProviderTable.createdBy, this.userId));

    const sort = (maxSortResult[0]?.max ?? -1) + 1;

    return this.db.insert(modelProviderTable).values({
      ...data,
      apiKey: data.apiKey ? encrypt(data.apiKey) : null,
      sort,
      createdBy: this.userId,
      updatedBy: this.userId,
    });
  }
  // update model provider
  update(id: string, data: Omit<NewModelProvider, "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">) {
    return this.db
      .update(modelProviderTable)
      .set({ ...data, apiKey: data.apiKey ? encrypt(data.apiKey) : null, updatedBy: this.userId })
      .where(and(eq(modelProviderTable.id, id), eq(modelProviderTable.createdBy, this.userId)));
  }
  // delete model provider
  delete(id: string) {
    return this.db
      .delete(modelProviderTable)
      .where(and(eq(modelProviderTable.id, id), eq(modelProviderTable.createdBy, this.userId)));
  }
  // init model providers
  init() {
    return initModelProviders(this.db, this.userId);
  }
}
