import type { AuthInstance } from "@workspace/auth/server";
import type { DatabaseInstance } from "@workspace/db/client";
import { appRouter } from "./routers";
import { createTRPCContext as createTRPCContextInternal } from "./trpc";

export const createApi = ({ auth, db }: { auth: AuthInstance; db: DatabaseInstance }) => {
  return {
    trpcRouter: appRouter,
    createTRPCContext: ({ headers }: { headers: Headers }) => createTRPCContextInternal({ auth, db, headers }),
  };
};

export type AppRouter = typeof appRouter;
//
export { ModelProviderService } from "./services/model-provider";
