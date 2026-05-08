import type { TreeItem } from "react-complex-tree";

export type CoFileType = "welcome" | "setting" | "board" | "tldraw" | "drawio" | "mindmap" | "note";
export type CoFileSuffix = ".excalidraw" | ".tldr" | ".drawio" | ".mindmap" | ".note";

export const FILE_SUFFIX_MAP: Record<CoFileType, CoFileSuffix | undefined> = {
  welcome: undefined,
  setting: undefined,
  board: ".excalidraw",
  tldraw: ".tldr",
  drawio: ".drawio",
  mindmap: ".mindmap",
  note: ".note",
};

export interface CoFile {
  id: string;
  name: string;
  type: CoFileType;
}

export interface CoFolder {
  id: string;
  name: string;
  type: "folder";
}

export type CoFileTree = { [key: string]: TreeItem<CoFile | CoFolder> };
