import { createTRPCReactClient, createTRPCProxy } from '@workspace/api/client';
import { env } from '@/env';

export const trpcClient = createTRPCReactClient({
  serverUrl: env.PUBLIC_SERVER_URL,
  apiPath: env.PUBLIC_SERVER_API_PATH,
});

export const api = createTRPCProxy({
  serverUrl: env.PUBLIC_SERVER_URL,
  apiPath: env.PUBLIC_SERVER_API_PATH,
});