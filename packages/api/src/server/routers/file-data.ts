import * as v from "valibot";

import { fileDataChangeSchema, FileDataService } from "../services/file-data";
import { protectedProcedure, router } from "../trpc";

export const fileDataRouter = router({
  applyChange: protectedProcedure
    .input(v.object({ files: v.array(fileDataChangeSchema) }))
    .mutation(async ({ ctx, input }) => {
      const results = [];
      const svc = new FileDataService(ctx.db, ctx.session.user.id);

      for (const change of input.files) {
        results.push(await svc.applyChange(change));
      }

      return results;
    }),

  all: protectedProcedure.query(async ({ ctx }) => {
    const svc = new FileDataService(ctx.db, ctx.session.user.id);
    return svc.getAll();
  }),

  one: protectedProcedure.input(v.object({ id: v.string() })).query(async ({ ctx, input }) => {
    const svc = new FileDataService(ctx.db, ctx.session.user.id);
    return svc.getOne(input.id);
  }),
});
