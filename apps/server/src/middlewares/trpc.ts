import { trpcServer } from "@hono/trpc-server";
import type { createApi } from "@workspace/api/server";

export const createTrpcMiddleware = (api: ReturnType<typeof createApi>) => {
  return trpcServer({
    endpoint: "/api/trpc",
    router: api.trpcRouter,
    createContext: (c) => api.createTRPCContext({ headers: c.req.headers }),
  });
};
