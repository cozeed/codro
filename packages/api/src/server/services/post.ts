import { desc, eq } from "@workspace/db";
import { postTable, userTable } from "@workspace/db/schema";
import type { DatabaseInstance } from "@workspace/db/client";

export class PostService {
  constructor(private db: DatabaseInstance) {
    this.db = db;
  }

  getAll() {
    return this.db
      .select({
        id: postTable.id,
        title: postTable.title,
        createdAt: postTable.createdAt,
      })
      .from(postTable)
      .orderBy(desc(postTable.createdAt));
  }

  async getOne(id: string) {
    const [row] = await this.db
      .select({
        id: postTable.id,
        title: postTable.title,
        content: postTable.content,
        createdAt: postTable.createdAt,
        author: { id: userTable.id, name: userTable.name },
      })
      .from(postTable)
      .innerJoin(userTable, eq(postTable.createdBy, userTable.id))
      .where(eq(postTable.id, id));

    return row;
  }

  create(data: { title: string; content: string; userId: string }) {
    return this.db.insert(postTable).values({
      createdBy: data.userId,
      title: data.title,
      content: data.content,
    });
  }

  delete(id: string) {
    return this.db.delete(postTable).where(eq(postTable.id, id));
  }
}
