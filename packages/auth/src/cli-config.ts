import { betterAuth } from "better-auth";
import { createDb } from "@workspace/db/client";

import { getBaseOptions } from "./server";

/**
 * @internal
 * The documentation for better-auth CLI can be found here:
 * - https://www.better-auth.com/docs/concepts/cli
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...getBaseOptions(createDb()),
});
