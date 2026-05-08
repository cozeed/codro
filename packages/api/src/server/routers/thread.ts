import { TRPCError } from '@trpc/server';
import * as v from 'valibot';
import { router, protectedProcedure } from '../trpc';
import { ThreadService } from '../services/thread';

export const threadRouter = router({
	all: protectedProcedure.query(async ({ ctx }) => {
		const svc = new ThreadService(ctx.db, ctx.session.user.id);
		return svc.list();
	}),

	create: protectedProcedure
		.input(v.object({ threadId: v.string(), title: v.optional(v.string()) }))
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			await svc.create(input.threadId, input.title ?? 'New Chat');
			return {};
		}),

	rename: protectedProcedure
		.input(v.object({ remoteId: v.string(), newTitle: v.string() }))
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			const result = await svc.rename(input.remoteId, input.newTitle);
			if (result.rowCount === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Thread not found: ${input.remoteId}`,
				});
			}
			return {};
		}),

	archive: protectedProcedure
		.input(v.object({ remoteId: v.string() }))
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			await svc.archive(input.remoteId);
			return {};
		}),

	unarchive: protectedProcedure
		.input(v.object({ remoteId: v.string() }))
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			await svc.unarchive(input.remoteId);
			return {};
		}),

	delete: protectedProcedure
		.input(v.object({ remoteId: v.string() }))
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			const result = await svc.delete(input.remoteId);
			if (result.rowCount === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Thread not found: ${input.remoteId}`,
				});
			}
			return {};
		}),

	generateTitle: protectedProcedure
		.input(
			v.object({
				remoteId: v.string(),
				unstable_messages: v.array(
					v.object({
						content: v.string(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			await svc.generateTitle(input.remoteId, input.unstable_messages);
			return {};
		}),
	fetch: protectedProcedure
		.input(v.object({ threadId: v.string() }))
		.query(async ({ ctx, input }) => {
			const svc = new ThreadService(ctx.db, ctx.session.user.id);
			return svc.fetch(input.threadId);
		}),
});
