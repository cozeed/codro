import * as fs from "@tauri-apps/plugin-fs";
import { isTauriApp } from "@/lib/navigator";

export const getFilenameFromPath = (path: string) => {
  const parts = path.split(/[/\\]/);
  const filename = parts.pop();
  return filename;
};

export const getFileNameWithoutSuffix = (filename: string) => {
  const lastDotIdx = filename.lastIndexOf(".");
  if (lastDotIdx === -1 || lastDotIdx === 0) {
    return filename;
  } else {
    return filename.slice(0, lastDotIdx)?.replace(".", "-");
  }
};

export const getFileSuffix = (filename: string): string => {
  const lastDotIdx = filename.lastIndexOf(".");
  if (lastDotIdx === -1 || lastDotIdx === 0) {
    return "";
  } else {
    return filename.slice(lastDotIdx);
  }
};
export const ensureDir = async (dir: string): Promise<boolean> => {
  try {
    if (!(await fs.exists(dir))) {
      await fs.mkdir(dir, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
};
export const readTextFile = async (path: string | URL, options?: fs.ReadFileOptions): Promise<string> => {
  const content: Uint8Array = await fs.readFile(path, options);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(content);
};
export const writeTextFile = async (path: string | URL, data: string, options?: fs.WriteFileOptions): Promise<void> => {
  const encoder = new TextEncoder();
  const value = encoder.encode(data);
  await fs.writeFile(path, value, options);
};

export const saveFile = async (data: Blob | Uint8Array, defaultName: string) => {
  if (isTauriApp()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({ defaultPath: defaultName });
    if (path) {
      const buf = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
      await writeFile(path, buf);
    }
  } else {
    const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
  }
};
