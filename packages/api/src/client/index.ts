import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import urlJoin from "url-join";

import type { AppRouter } from "../server";

export interface APIClientOptions {
  serverUrl: string;
  apiPath: `/${string}`;
}

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

export const createTRPCReactClient = ({ serverUrl, apiPath }: APIClientOptions) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: urlJoin(serverUrl, apiPath, "/trpc"),
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            /**
             * https://trpc.io/docs/client/cors
             *
             * This is required if you are deploying your frontend (web)
             * and backend (server) on two different domains.
             */
            credentials: "include",
          });
        },
      }),
    ],
  });
};

export const createTRPCProxy = ({ serverUrl, apiPath }: APIClientOptions) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: urlJoin(serverUrl, apiPath, "/trpc"),
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            /**
             * https://trpc.io/docs/client/cors
             *
             * This is required if you are deploying your frontend (web)
             * and backend (server) on two different domains.
             */
            credentials: "include",
          });
        },
      }),
    ],
  });
};
