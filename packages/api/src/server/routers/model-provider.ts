import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { protectedProcedure, router } from "../trpc";
import { CreateModelProviderSchema, UpdateModelProviderSchema } from "@workspace/db/schema";
import { ModelProviderService } from "../services/model-provider";

const modelProviderRouter = router({
  all: protectedProcedure.query(({ ctx }) => {
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    return svc.getAllByUser();
  }),

  one: protectedProcedure.input(v.object({ id: v.pipe(v.string(), v.uuid()) })).query(async ({ ctx, input }) => {
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    const item = await svc.getOne(input.id);
    if (!item) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No such modelProvider with ID ${input.id}`,
      });
    }
    return item;
  }),

  create: protectedProcedure.input(CreateModelProviderSchema).mutation(async ({ ctx, input }) => {
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    await svc.create(input);
    return {};
  }),
  update: protectedProcedure.input(UpdateModelProviderSchema).mutation(async ({ ctx, input }) => {
    const { id, ...rest } = input;
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    const updated = await svc.update(id, rest);
    if (!updated) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Update failed with id: ${id}`,
      });
    }
    return updated;
  }),

  delete: protectedProcedure.input(v.object({ id: v.pipe(v.string(), v.uuid()) })).mutation(async ({ ctx, input }) => {
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    const res = await svc.delete(input.id);
    if (res.rowCount === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No such modelProvider with id ${input.id}`,
      });
    }
    return {};
  }),

  init: protectedProcedure.mutation(async ({ ctx }) => {
    const svc = new ModelProviderService(ctx.db, ctx.session.user.id);
    await svc.init();
    return {};
  }),
});

export default modelProviderRouter;
