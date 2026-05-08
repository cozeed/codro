import { threadTable, messageTable } from '@workspace/db/schema';
import { eq, desc, and } from '@workspace/db';
import type { DatabaseInstance } from '@workspace/db/client';

export class ThreadService {
	constructor(private db: DatabaseInstance, private userId: string) { }

	list() {
		return this.db
			.select()
			.from(threadTable)
			.where(eq(threadTable.createdBy, this.userId))
			.orderBy(desc(threadTable.createdAt));
	}

	create(id: string, title: string = 'New Chat') {
		return this.db.insert(threadTable).values({
			id,
			title,
			createdBy: this.userId,
			updatedBy: this.userId,
		});
	}

	rename(id: string, title: string) {
		return this.db
			.update(threadTable)
			.set({ title, updatedBy: this.userId })
			.where(and(eq(threadTable.id, id), eq(threadTable.createdBy, this.userId)));
	}

	archive(id: string) {
		return this.db
			.update(threadTable)
			.set({ archived: true, updatedBy: this.userId })
			.where(and(eq(threadTable.id, id), eq(threadTable.createdBy, this.userId)));
	}

	unarchive(id: string) {
		return this.db
			.update(threadTable)
			.set({ archived: false, updatedBy: this.userId })
			.where(and(eq(threadTable.id, id), eq(threadTable.createdBy, this.userId)));
	}

	async delete(id: string) {
		await this.db.delete(messageTable).where(eq(messageTable.threadId, id));
		return this.db
			.delete(threadTable)
			.where(and(eq(threadTable.id, id), eq(threadTable.createdBy, this.userId)));
	}

	async generateTitle(id: string, messages: { content: string }[]) {
		const firstLine = messages[0]?.content.slice(0, 20) ?? 'New Chat';
		return this.rename(id, firstLine);
	}
	async fetch(id: string) {
		const thread = await this.db
			.select()
			.from(threadTable)
			.where(and(eq(threadTable.id, id), eq(threadTable.createdBy, this.userId)))
			.limit(1);
		return thread[0];
	}
}
