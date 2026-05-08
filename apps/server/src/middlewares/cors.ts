import { cors } from "hono/cors";
import { getTrustedOrigins } from "@workspace/auth/server";

import { env } from "../env";

const trustedOrigins = getTrustedOrigins(env.PUBLIC_WEB_URL);
// CORS middleware
export const createCorsMiddleware = () => {
  return {
    betterAuth: cors({
      origin: trustedOrigins,
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
    }),
    all: cors({ origin: trustedOrigins, credentials: true }),
  };
};
