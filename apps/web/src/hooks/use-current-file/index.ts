import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import type { TreeItem } from "react-complex-tree";
import type { CoFile, CoFolder } from "@/types/file";
import { currentFileIdAtom, focusItemIdAtom, selectedItemIdsAtom } from "@/store/jotai";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { useOpenItemIds } from "@/hooks/use-open-item-ids";

export function useCurrentFile() {
  const [, setSelectedItemIds] = useAtom(selectedItemIdsAtom);
  const [currentFileId, setCurrentFileId] = useAtom(currentFileIdAtom);
  const { addOpenItemIds } = useOpenItemIds();
  const [, setFocusItemId] = useAtom(focusItemIdAtom);
  const { fileTreeData } = useFileTreeQuery();

  // build parentId map
  const parentIdMap = useMemo(() => {
    const map: Record<string, string> = {};

    Object.values(fileTreeData as Record<string, TreeItem<CoFile | CoFolder>>).forEach((item) => {
      item.children?.forEach((childId) => {
        map[childId] = item.data.id; // child -> parent
      });
    });
    return map;
  }, [fileTreeData]);

  // find all parentIds of fileId
  const findFileParentIds = useCallback(
    (fileId: string): string[] => {
      //
      const parentIds: string[] = [];
      let current = parentIdMap[fileId];
      while (current) {
        parentIds.push(current);
        current = parentIdMap[current];
      }
      return parentIds;
    },
    [parentIdMap],
  );

  const setCurrentFile = useCallback(
    (fileId: string) => {
      // set currentFileId
      setCurrentFileId(fileId || "");
      // set focusItemId
      setFocusItemId(fileId || "");
      // set selectedItemIds
      setSelectedItemIds(fileId ? [fileId] : []);
      // add parentIds to openItemIds
      if (fileId) {
        const parentIds = findFileParentIds(fileId);

        if (parentIds.length) {
          addOpenItemIds(parentIds);
        }
      }

      return fileId;
    },
    [findFileParentIds, addOpenItemIds, setCurrentFileId, setFocusItemId, setSelectedItemIds],
  );

  return { currentFileId, setCurrentFile };
}
