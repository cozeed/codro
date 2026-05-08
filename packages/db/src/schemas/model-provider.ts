import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { userTable } from "./auth";

export const modelProviderTable = pgTable("model_provider", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  name: t.varchar("name", { length: 64 }).notNull(), // e.g. 'openai'
  baseUrl: t.text("base_url").notNull(),
  apiKey: t.text("api_key"),
  models: t.text("models").notNull(), // 'gpt-4o,gpt-4o-mini'
  sort: t.integer("sort").notNull().default(0),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  createdBy: t
    .text("created_by")
    .notNull()
    .references(() => userTable.id),
  updatedAt: t
    .timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: t.text("updated_by").references(() => userTable.id),
}));

// =========================
// Create Schema
// =========================
export const CreateModelProviderSchema = v.omit(
  createInsertSchema(modelProviderTable, {
    name: v.pipe(v.string(), v.maxLength(64)),
    baseUrl: v.string(),
    apiKey: v.optional(v.string()),
    models: v.string(),
    sort: v.pipe(v.number(), v.minValue(0)),
  }),
  ["id", "createdAt", "createdBy", "updatedAt", "updatedBy"],
);

// =========================
// Update Schema
// =========================
export const UpdateModelProviderSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.maxLength(64)),
  baseUrl: v.string(),
  apiKey: v.optional(v.string()),
  models: v.string(),
  sort: v.pipe(v.number(), v.minValue(0)),
});

// =========================
// Types
// =========================
export type NewModelProvider = typeof modelProviderTable.$inferInsert;
export type ModelProviderItem = typeof modelProviderTable.$inferSelect;
