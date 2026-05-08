import { messageTable } from "@workspace/db/schema";
import { eq, asc } from "@workspace/db";
import type { DatabaseInstance } from "@workspace/db/client";

export class MessageService {
  constructor(private db: DatabaseInstance) {}

  findByThread(threadId: string) {
    return this.db
      .select()
      .from(messageTable)
      .where(eq(messageTable.threadId, threadId))
      .orderBy(asc(messageTable.createdAt));
  }

  create(input: { id: string; threadId: string; role: string; content: string; createdAt: Date }) {
    return this.db.insert(messageTable).values({
      ...input,
    });
  }

  deleteByThread(threadId: string) {
    return this.db.delete(messageTable).where(eq(messageTable.threadId, threadId));
  }
}
