import { useCallback, useState } from "react";
import { dbclickMenuTreeItemAfterCreate } from "@/utils/dom";
import type { Model } from "flexlayout-react";
import { useAtom } from "jotai";
import type { CoFile, CoFileType } from "@/types/file";
import { renamingItemIdAtom } from "@/store/jotai";
import { useFileTreeDb } from "@/hooks/use-file-tree-db";

import { useCurrentFile } from "../use-current-file";
import { useOpenItemIds } from "../use-open-item-ids";
import { useTabJsonModel } from "../use-tab-json-model";

export function useAddFile() {
  const fileTreeDb = useFileTreeDb();
  const { setCurrentFile } = useCurrentFile();
  const { addOpenItemIds } = useOpenItemIds();
  const { updateTabOnFileChange } = useTabJsonModel();
  const [, setRenamingMenuItemId] = useAtom(renamingItemIdAtom);
  const [isAdding, setIsAdding] = useState(false);

  const addFile = useCallback(
    async (
      name: string,
      type: CoFileType,
      tabModel: Model | undefined,
      parentId?: string,
      fileContent?: string,
    ): Promise<CoFile | undefined> => {
      if (!tabModel) return;
      setIsAdding(true);

      try {
        const file = await fileTreeDb?.addFile(name, type, parentId, fileContent);
        if (!file) {
          console.warn("⚠️ addFile: failed to add file to database.");
          return;
        }

        // add parentId to openItemIds
        if (parentId) {
          addOpenItemIds([parentId]);
        }
        // set renamingMenuItemId
        setRenamingMenuItemId(file.id);
        // double click menu tree item to open file
        dbclickMenuTreeItemAfterCreate(file.id);
        // set current file
        setCurrentFile(file.id);
        // update tab on file change
        updateTabOnFileChange(file, tabModel);

        return file;
      } finally {
        setIsAdding(false);
      }
    },
    [fileTreeDb, setCurrentFile, addOpenItemIds, updateTabOnFileChange, setRenamingMenuItemId],
  );

  return { addFile, isAdding };
}
