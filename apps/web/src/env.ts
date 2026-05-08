import * as v from "valibot";

export const envSchema = v.object({
  /**
   * This is the backend API server. Note that this should be passed as
   * a build-time variable (ARG) in docker.
   */
  PUBLIC_SERVER_URL: v.pipe(v.string(), v.url()),
  PUBLIC_SERVER_API_PATH: v.pipe(
    v.optional(v.string(), "/api"),
    v.transform((val) => (val.startsWith("/") ? val : `/${val}`) as `/${string}`),
  ),
  /**
   * This is the frontend web server.
   */
  PUBLIC_WEB_URL: v.pipe(v.string(), v.url()),
  PUBLIC_ASSISTANT_BASE_URL: v.pipe(v.string(), v.url()),
});

export const env = v.parse(envSchema, import.meta.env);
