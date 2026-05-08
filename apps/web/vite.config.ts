import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-oxc";
import { defineConfig } from "vite";

/**
 * Fixes issue with "__dirname is not defined in ES module scope"
 * https://flaviocopes.com/fix-dirname-not-defined-es-module-scope
 *
 * This is only necessary when using vite with `--configLoader runner`.
 * We use this option to allow for importing TS files from monorepos.
 * https://vite.dev/config/#configuring-vite
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = process.env.TAURI_DEV_HOST;

console.log("PUBLIC_SERVER_URL=", process.env.PUBLIC_SERVER_URL);
console.log("PUBLIC_SERVER_API_PATH=", process.env.PUBLIC_SERVER_API_PATH);
console.log("PUBLIC_WEB_URL=", process.env.PUBLIC_WEB_URL);
console.log("PUBLIC_ASSISTANT_BASE_URL=", process.env.PUBLIC_ASSISTANT_BASE_URL);
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      // Configure aliases
      "@": path.resolve(__dirname, "src"),
      "@workspace/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@workspace/api": path.resolve(__dirname, "../../packages/api/src"),
      "@workspace/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@workspace/db": path.resolve(__dirname, "../../packages/db/src"),
      "@workspace/server": path.resolve(__dirname, "../server/src"),
    },
  },
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.wasm", "**/*.data"],
  optimizeDeps: {
    exclude: ["@workspace/pglite", "@electric-sql/pglite"], // Avoid pre-build breaking wasm/data
  },
  worker: {
    format: "es", // Web Worker: ES Module
  },
  // publicDir: 'public', // default is 'public'
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    proxy: {
      "/api": {
        target: process.env.PUBLIC_SERVER_URL,
        changeOrigin: true,
      },
    },
    watch: {
      // Ignore files in the src-tauri directory
      ignored: ["**/src-tauri/**"],
    },
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_", "PUBLIC_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "oxc" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@electric-sql/pglite") || id.includes("@workspace/pglite")) {
              return "pglite";
            }
            const modulePath = id.split("node_modules/")[1];
            const topLevelFolder = modulePath?.split("/")[0];
            if (topLevelFolder !== ".pnpm") {
              return topLevelFolder;
            }
            const scopedPackageName = modulePath?.split("/")[1];
            const chunkName = scopedPackageName?.split("@")[scopedPackageName.startsWith("@") ? 1 : 0];
            return chunkName;
          }
        },
      },
    },
  },
});
