import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import urlJoin from "url-join";
import type { DatabaseInstance } from "@workspace/db/client";
import { accountTable, sessionTable, userTable, verificationTable } from "@workspace/db/schema";

export interface AuthOptions {
  webUrl: string;
  authSecret: string;
  serverUrl: string;
  apiPath: `/${string}`;
  db: DatabaseInstance;
}

export type AuthInstance = ReturnType<typeof createAuth>;

/**
 * This function is abstracted for schema generations in cli-config.ts
 */
export const getBaseOptions = (db: DatabaseInstance): BetterAuthOptions =>
  ({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: userTable,
        session: sessionTable,
        account: accountTable,
        verification: verificationTable,
      },
    }),
    plugins: [openAPI()],
  }) satisfies BetterAuthOptions;

export const getTrustedOrigins = (webUrl: string): string[] => [new URL(webUrl).origin, "http://tauri.localhost", "https://tauri.localhost"];

export const createAuth = ({ webUrl, serverUrl, apiPath, db, authSecret }: AuthOptions) =>
  betterAuth({
    ...getBaseOptions(db),
    baseURL: urlJoin(serverUrl, apiPath, "auth"),
    secret: authSecret,
    trustedOrigins: getTrustedOrigins(webUrl),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30,
      },
    },
    account: {
      skipStateCookieCheck: true,
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        prompt: "select_account",
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        prompt: "consent",
      },
    },
  });
