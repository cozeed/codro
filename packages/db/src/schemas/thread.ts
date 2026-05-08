import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { userTable } from "./auth";

export const threadTable = pgTable("thread", (t) => ({
  id: t.varchar("id", { length: 64 }).primaryKey(),
  title: t.text("title").notNull().default("New Chat"),
  archived: t.boolean("archived").notNull().default(false),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: t
    .text("created_by")
    .notNull()
    .references(() => userTable.id),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  updatedBy: t.text("updated_by").references(() => userTable.id),
}));

// =========================
// Create Schema
// =========================
export const CreateThreadSchema = v.omit(
  createInsertSchema(threadTable, {
    title: v.pipe(v.string(), v.maxLength(255)),
    archived: v.boolean(),
  }),
  ["id", "createdAt", "createdBy", "updatedAt", "updatedBy"],
);

// =========================
// Update Schema
// =========================
export const UpdateThreadSchema = v.object({
  id: v.string(),
  title: v.pipe(v.string(), v.maxLength(255)),
  archived: v.boolean(),
});

// =========================
// Types
// =========================
export type NewThread = typeof threadTable.$inferInsert;
export type ThreadItem = typeof threadTable.$inferSelect;
