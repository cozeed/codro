import { DEFAULT_LANG_CODE, DEFAULT_TAB_JSON_MODEL } from "@/utils/constant";
import type { IJsonModel, Model } from "flexlayout-react";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { coFileRegistry } from "@/plugins/registry";

const LOCALSTORAGE_LANG_CODE = "lang_code";
const LOCALSTORAGE_OPEN_ITEM_IDS = "open_item_ids";
const LOCALSTORAGE_SELECTED_ITEM_IDS = "selected_item_ids";
const LOCALSTORAGE_RENAMING_ITEM_ID = "renaming_item_id";
const LOCALSTORAGE_FOCUS_ITEM_ID = "focus_item_id";
const LOCALSTORAGE_CURRENT_FILE_ID = "current_file_id";
const LOCALSTORAGE_TAB_JSON_MODEL = "tab_json_model";
const LOCALSTORAGE_CURRENT_MODEL = "current_model";
const LOCALSTORAGE_DISABLED_PLUGIN_IDS = "disabled_plugin_ids";

type Theme = "light" | "dark";

export const tabJsonModelAtom = atomWithStorage<IJsonModel>(LOCALSTORAGE_TAB_JSON_MODEL, DEFAULT_TAB_JSON_MODEL);
export const tabModelAtom = atom<Model | undefined>(undefined);
export const currentFileIdAtom = atomWithStorage<string>(LOCALSTORAGE_CURRENT_FILE_ID, "");
export const selectedItemIdsAtom = atomWithStorage<string[]>(LOCALSTORAGE_SELECTED_ITEM_IDS, []);
export const openItemIdsAtom = atomWithStorage<string[]>(LOCALSTORAGE_OPEN_ITEM_IDS, []);
export const renamingItemIdAtom = atomWithStorage<string>(LOCALSTORAGE_RENAMING_ITEM_ID, "");
export const focusItemIdAtom = atomWithStorage<string>(LOCALSTORAGE_FOCUS_ITEM_ID, "");
export const deletingItemIdAtom = atom<string>("");

export const langCodeAtom = atomWithStorage(LOCALSTORAGE_LANG_CODE, DEFAULT_LANG_CODE);
export const themeAtom = atom<Theme>("light");
export const siderbarCollapsedAtom = atom(false);
export const activeTitleAtom = atom<string>("Profile");
export const currentModelAtom = atomWithStorage<string>(LOCALSTORAGE_CURRENT_MODEL, "");
export const showThreadListAtom = atom(false);
export const currentSidebarAtom = atom<"main" | "chat">("main");
export const isSavingAtom = atom(false);
export const disabledPluginIdsAtom = atomWithStorage<string[]>(LOCALSTORAGE_DISABLED_PLUGIN_IDS, []);

export const enabledPluginsAtom = atom((get) => {
  const disabledIds = new Set(get(disabledPluginIdsAtom));
  return coFileRegistry.listAll().filter((p) => !disabledIds.has(p.id));
});
