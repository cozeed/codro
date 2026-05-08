import { env } from "@/env";
import { createAuthClient } from "@workspace/auth/client";

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient = createAuthClient({
  apiBaseUrl: env.PUBLIC_SERVER_URL,
  apiBasePath: env.PUBLIC_SERVER_API_PATH,
}) as AuthClient;

export type AuthSession = AuthClient["$Infer"]["Session"] | null;
