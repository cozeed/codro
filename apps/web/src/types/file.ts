import type { TreeItem } from "react-complex-tree";

export type CoFileType = string;

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
