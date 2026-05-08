import { app } from "@tauri-apps/api";
import { isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
import { open as shellOpen } from "@tauri-apps/plugin-shell";

// is browser environment
export const isBrowser = () => {
  return typeof window !== "undefined";
};
// is tauri app environment
export const isTauriApp = () => {
  return isBrowser() && isTauri();
};
// get language
export const getLanguage = () => {
  let language = navigator.language || "en";
  if (language === "en-US") {
    language = "en";
  }
  // console.log("getLanguage=", language);
  return language;
};
// is macOS
export const isMacOS = (): boolean => {
  return platform() === "macos";
};
// is Windows
export const isWindows = (): boolean => {
  return platform() === "windows";
};
// is Linux
export const isLinux = (): boolean => {
  return platform() === "linux";
};
// get product name
export const getProductName = async (): Promise<string> => {
  const productName = await app.getName();
  return productName;
};
// get app version
export const getAppVersion = async (): Promise<string> => {
  const version = await app.getVersion();
  return version;
};
// open link
export const openLink = (url: string) => {
  if (!isTauriApp()) {
    window.open(url, "_blank")?.focus();
  } else {
    shellOpen(url);
  }
};
