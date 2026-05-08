import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const fileDataTable = pgTable(
  "file_data",
  {
    id: text("id").primaryKey(),
    type: text("type").notNull(), // file_tree/board/tldraw/drawio/mindmap/note
    data: jsonb("data").$type<unknown>().notNull(),
    userId: text("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deleted: boolean("deleted").default(false).notNull(),
  },
  (table) => [
    index("type_idx").on(table.type),
    index("user_id_idx").on(table.userId),
    index("user_type_idx").on(table.userId, table.type),
  ],
);

export type NewFileData = typeof fileDataTable.$inferInsert;
export type FileDataItem = typeof fileDataTable.$inferSelect;
