import { useCallback, useState } from "react";
import { dbclickMenuTreeItemAfterCreate } from "@/utils/dom";
import { useAtom } from "jotai";
import { renamingItemIdAtom } from "@/store/jotai";
import { useFileTreeDb } from "@/hooks/use-file-tree-db";

import { useCurrentFile } from "../use-current-file";
import { useOpenItemIds } from "../use-open-item-ids";

export function useAddFolder() {
  const fileTreeDb = useFileTreeDb();
  const [, setRenamingMenuItemId] = useAtom(renamingItemIdAtom);
  const { setCurrentFile } = useCurrentFile();
  const { addOpenItemIds } = useOpenItemIds();
  const [isAdding, setIsAdding] = useState(false);

  const addFolder = useCallback(
    async (name: string, parentId?: string) => {
      setIsAdding(true);
      try {
        const folder = await fileTreeDb?.addFolder(name, parentId);
        if (!folder) {
          return;
        }

        // add parentId to openItemIds
        if (parentId) {
          addOpenItemIds([parentId]);
        }
        // set renamingMenuItemId
        setRenamingMenuItemId(folder.id);
        // double click menu tree item to open folder
        dbclickMenuTreeItemAfterCreate(folder.id);
        // set current file
        setCurrentFile("");
      } finally {
        setIsAdding(false);
      }
    },
    [fileTreeDb, setCurrentFile, addOpenItemIds, setRenamingMenuItemId],
  );

  return { addFolder, isAdding };
}
