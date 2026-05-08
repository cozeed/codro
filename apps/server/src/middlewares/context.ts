import type { MiddlewareHandler } from "hono";
import type { AuthInstance } from "@workspace/auth/server";
import type { DatabaseInstance } from "@workspace/db/client";

export const createContextMiddleware = (db: DatabaseInstance, auth: AuthInstance): MiddlewareHandler => {
  return async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
    const user = session?.user ?? null;

    c.set("db", db);
    c.set("user", user);
    await next();
  };
};
