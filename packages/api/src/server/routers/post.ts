import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { PostService } from "../services/post";
import { CreatePostSchema } from "@workspace/db/schema";

const postRouter = router({
  all: protectedProcedure.query(({ ctx }) => {
    const svc = new PostService(ctx.db);
    return svc.getAll();
  }),

  one: publicProcedure.input(v.object({ id: v.pipe(v.string(), v.uuid()) })).query(async ({ ctx, input }) => {
    const svc = new PostService(ctx.db);
    const post = await svc.getOne(input.id);
    if (!post) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No such post with ID ${input.id}`,
      });
    }
    return post;
  }),

  create: protectedProcedure.input(CreatePostSchema).mutation(async ({ ctx, input }) => {
    const svc = new PostService(ctx.db);
    await svc.create({ ...input, userId: ctx.session.user.id });
    return {};
  }),

  delete: protectedProcedure.input(v.object({ id: v.pipe(v.string(), v.uuid()) })).mutation(async ({ ctx, input }) => {
    const svc = new PostService(ctx.db);
    const res = await svc.delete(input.id);
    if (res.rowCount === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No such post with id ${input.id}`,
      });
    }
    return {};
  }),
});

export default postRouter;
