import { isTauri } from "@tauri-apps/api/core";
import type { OsType } from "@tauri-apps/plugin-os";

const osType: OsType | undefined = undefined;
let osTypePromise: Promise<OsType> | null = null;

if (typeof window !== "undefined" && isTauri()) {
  osTypePromise = import("@tauri-apps/plugin-os").then((module) => {
    return module.type();
  });
}

// A helper function to get the OS type, which returns a Promise
export function getOsType(): Promise<OsType> {
  if (!osTypePromise) {
    // If the module was already loaded, just return the result
    return Promise.resolve(osType!); // Use non-null assertion
  }

  // If the module is still loading, wait for it to finish and return the result
  return osTypePromise;
}
