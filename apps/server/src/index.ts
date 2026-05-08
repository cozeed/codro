import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { setSignedCookie } from "hono/cookie";
import { logger } from "hono/logger";
import { ProxyAgent, setGlobalDispatcher } from "undici";
import { createApi } from "@workspace/api/server";
import { createAuth } from "@workspace/auth/server";
import { createDb } from "@workspace/db/client";

import { env } from "./env";
import { createContextMiddleware } from "./middlewares/context";
import { createCorsMiddleware } from "./middlewares/cors";
import { createTrpcMiddleware } from "./middlewares/trpc";
import restRouter from "./routers";

// If needed, configure global proxy
if (env.HTTP_PROXY) {
  setGlobalDispatcher(new ProxyAgent(env.HTTP_PROXY));
}
// Wildcard paths for routing
const wildcardPath = {
  ALL: "/api/*",
  BETTER_AUTH: "/api/auth/*",
  TRPC: "/api/trpc/*",
  UPLOADS: "/api/uploads/*",
} as const;
// Initialize database, authentication, and API
const db = createDb({ databaseUrl: env.SERVER_POSTGRES_URL });
const auth = createAuth({
  webUrl: env.PUBLIC_WEB_URL,
  serverUrl: env.PUBLIC_SERVER_URL,
  apiPath: env.PUBLIC_SERVER_API_PATH,
  authSecret: env.SERVER_AUTH_SECRET,
  db,
});
const api = createApi({ auth, db });

// Initialize Hono application
const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();
// Logging middleware
app.use(logger());
// Context middleware
app.use(createContextMiddleware(db, auth));
// Static file middleware
app.use(
  wildcardPath.UPLOADS,
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace("/api/uploads", "/uploads"),
    onNotFound: (path) => console.log(`File not found: ${path}`),
  }),
);
// CORS middleware
const corsMiddleware = createCorsMiddleware();
app.use(wildcardPath.BETTER_AUTH, corsMiddleware.betterAuth);
app.use(wildcardPath.ALL, corsMiddleware.all);
// TRPC middleware
app.use(wildcardPath.TRPC, createTrpcMiddleware(api));

// OAuth bridge for Tauri system-browser flow.
// After better-auth completes the OAuth callback, it redirects here.
// We extract the session token and redirect to the local TCP server running in the Tauri app.
app.get("/api/tauri-auth-bridge", async (c) => {
  const port = c.req.query("port");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const token = session?.session?.token;
  if (token && port) {
    console.log("[oauth-bridge] got session, redirecting to localhost:", port);
    return c.redirect(`http://127.0.0.1:${port}?token=${token}`);
  }
  console.log("[oauth-bridge] failed: token=%s port=%s", !!token, port);
  return c.html("<html><body><h2>Login failed</h2><p>Please try again.</p></body></html>");
});

// Called by Tauri app after receiving token via local TCP server.
// Sets the session cookie so better-auth can read it.
// better-auth prefixes with __Secure- when on HTTPS.
const sessionCookieName = env.PUBLIC_SERVER_URL.startsWith("https://")
  ? "__Secure-better-auth.session_token"
  : "better-auth.session_token";

app.get("/api/set-session", async (c) => {
  const token = c.req.query("token");
  if (!token) return c.json({ success: false });
  await setSignedCookie(c, sessionCookieName, token, env.SERVER_AUTH_SECRET, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 24 * 30,
  });
  return c.json({ success: true });
});

// Authentication routes
app.on(["POST", "GET"], wildcardPath.BETTER_AUTH, (c) => auth.handler(c.req.raw));

// REST routes
app.route("/", restRouter);

export default app;
