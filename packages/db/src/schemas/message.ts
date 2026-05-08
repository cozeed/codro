import { pgTable } from "drizzle-orm/pg-core";

import { threadTable } from "./thread";

export const messageTable = pgTable("message", (t) => ({
  id: t.varchar("id", { length: 64 }).primaryKey(),
  threadId: t
    .varchar("thread_id", { length: 64 })
    .notNull()
    .references(() => threadTable.id),
  role: t.text("role").notNull(), // "user" | "assistant" | "system"
  content: t.text("content").notNull(),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}));

export type NewMessage = typeof messageTable.$inferInsert;
export type MessageItem = typeof messageTable.$inferSelect;
