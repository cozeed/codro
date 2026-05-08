import * as v from "valibot";

const DEFAULT_SERVER_PORT = 3035;
const DEFAULT_SERVER_HOST = "localhost";

const createPortSchema = ({ defaultPort }: { defaultPort: number }) =>
  v.pipe(
    v.optional(v.string(), `${defaultPort}`),
    v.transform((s) => parseInt(s, 10)),
    v.number(),
    v.minValue(0),
    v.maxValue(65535),
  );

export const envSchema = v.object({
  SERVER_PORT: createPortSchema({ defaultPort: DEFAULT_SERVER_PORT }),
  SERVER_HOST: v.pipe(v.optional(v.string(), DEFAULT_SERVER_HOST), v.minLength(1)),
  SERVER_AUTH_SECRET: v.pipe(v.string(), v.minLength(1)),
  SERVER_POSTGRES_URL: v.string(),
  // HTTP Proxy
  HTTP_PROXY: v.optional(v.string(), ""),
  // Backend URL, used to configure OpenAPI (Scalar)
  PUBLIC_SERVER_URL: v.pipe(v.string(), v.url()),
  PUBLIC_SERVER_API_PATH: v.pipe(
    v.optional(v.string(), "/api"),
    v.transform((val) => (val.startsWith("/") ? val : `/${val}`) as `/${string}`),
  ),
  // Frontend URL, used to configure trusted origin (CORS)
  PUBLIC_WEB_URL: v.pipe(v.string(), v.url()),
  // Storage
  DRIVE_DISK: v.optional(v.enum({ fs: "fs", r2: "r2" }), "fs"),
  R2_ACCESS_KEY_ID: v.optional(v.string(), ""),
  R2_SECRET_ACCESS_KEY: v.optional(v.string(), ""),
  R2_ENDPOINT: v.optional(v.string(), ""),
  R2_BUCKET: v.optional(v.string(), ""),
  R2_SUBDOMAIN: v.optional(v.string(), ""),

  // App encryption key
  APP_ENCRYPTION_KEY: v.pipe(v.string(), v.minLength(32)),
  // tavily
  TAVILY_API_KEY: v.optional(v.string(), ""),
});

export const env = v.parse(envSchema, process.env);
