import * as v from 'valibot';
import { router, protectedProcedure } from '../trpc';
import { MessageService } from '../services/message';

export const messageRouter = router({
	listByThread: protectedProcedure
		.input(
			v.object({
				threadId: v.pipe(v.string(), v.minLength(1)),
			}),
		)
		.query(async ({ ctx, input }) => {
			const svc = new MessageService(ctx.db);
			return svc.findByThread(input.threadId);
		}),

	create: protectedProcedure
		.input(
			v.object({
				id: v.string(),
				threadId: v.pipe(v.string(), v.minLength(1)),
				role: v.string(), // Use v.enum(['user', 'assistant', 'system']) for stricter validation
				content: v.string(),
				createdAt: v.date(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const svc = new MessageService(ctx.db);
			await svc.create(input);
			return {};
		}),
	// Delete all messages of a thread
	deleteByThread: protectedProcedure
		.input(
			v.object({
				threadId: v.pipe(v.string(), v.minLength(1)),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const svc = new MessageService(ctx.db);
			await svc.deleteByThread(input.threadId);
			return {};
		}),

});