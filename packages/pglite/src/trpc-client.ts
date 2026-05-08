import type { TRPCClient } from "@trpc/client";
import { createTRPCProxy } from "@workspace/api/client";
import type { AppRouter } from "@workspace/api/server";

export const api: TRPCClient<AppRouter> = createTRPCProxy({
  serverUrl: import.meta.env.PUBLIC_SERVER_URL,
  apiPath: import.meta.env.PUBLIC_SERVER_API_PATH,
});
