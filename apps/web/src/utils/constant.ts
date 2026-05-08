import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";
import type { IJsonModel } from "flexlayout-react";
import type { CoFile, CoFileTree } from "@/types/file";
import { getLanguage } from "@/lib/navigator";

export const DOUBLE_LINK_REGEX = /^\[\[(.+)\]\]$/;
export const DEFAULT_LANG_CODE = getLanguage();
export const DEFAULT_EMPTY_TAB_ID = "new_tab";

// welcome page
export const WELCOME_FILE: CoFile = {
  id: "welcome",
  name: "Welcome Page",
  type: "welcome",
};

// setting page
export const SETTING_FILE: CoFile = {
  id: "setting",
  name: "Setting page",
  type: "setting",
};

export const DEFAULT_TAB_JSON_MODEL: IJsonModel = {
  global: {
    tabEnableRename: false,
  },
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 10,
        selected: 0,
        children: [],
      },
    ],
  },
};

export const DEFAULT_FILE_TREE: CoFileTree = {
  root: {
    index: "root",
    children: [],
    isFolder: true,
    canMove: false,
    canRename: false,
    data: {
      id: "root",
      name: "root",
      type: "folder",
    },
  },
};

export const DEFAULT_BOARD_DATA: ExcalidrawInitialDataState = {
  type: "excalidraw",
  version: 2,
  source: window.location.href,
  elements: [],
  appState: {
    gridSize: 20,
    viewBackgroundColor: "#ffffff",
  },
  files: {},
};
