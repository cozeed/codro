import type { Api } from "@/utils/api";
declare global {
  interface Window {
    api?: Api;

    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      types?: {
        description?: string;
        accept: Record<string, string[]>;
      }[];
    }) => Promise<FileSystemFileHandle[]>;
  }
}

export {};
