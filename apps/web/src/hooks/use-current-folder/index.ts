import { useMemo } from "react";
import { useAtom } from "jotai";
import { focusItemIdAtom, selectedItemIdsAtom } from "@/store/jotai";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";

export function useCurrentFolder() {
  const [selectedItemIds] = useAtom(selectedItemIdsAtom);
  const { fileTreeData } = useFileTreeQuery();
  const [focusItemId] = useAtom(focusItemIdAtom);

  const currentFolderId = useMemo(() => {
    // Build candidate list by priority, focus first
    const candidates = focusItemId ? [focusItemId, ...selectedItemIds] : selectedItemIds;

    for (const id of candidates) {
      if (id.startsWith("folder_")) {
        // Item itself is a folder
        return id;
      }
      // If it's a file, find its parent folder
      const parent = Object.values(fileTreeData).find((item) => item.children?.includes(id));
      if (parent) return parent.data.id;
    }
    return undefined;
  }, [selectedItemIds, fileTreeData, focusItemId]);

  return { currentFolderId };
}
