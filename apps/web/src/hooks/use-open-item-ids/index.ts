import { useCallback } from "react";
import { useAtom } from "jotai";
import { openItemIdsAtom } from "@/store/jotai";

export function useOpenItemIds() {
  const [openItemIds, setOpenItemIds] = useAtom(openItemIdsAtom);

  const addOpenItemIds = useCallback(
    (itemIds: string[]) => {
      setOpenItemIds((prevItemIds) => {
        const notChanged = itemIds.every((itemId) => openItemIds.includes(itemId));
        if (notChanged) return prevItemIds;

        const mergedItemIds = [...prevItemIds, ...itemIds].filter(Boolean);
        const uniqueItemIds = Array.from(new Set(mergedItemIds));
        return uniqueItemIds;
      });
    },
    [openItemIds, setOpenItemIds],
  );

  const removeOpenItemId = useCallback(
    (itemId: string) => {
      setOpenItemIds((prevItemIds) => {
        if (!prevItemIds.includes(itemId)) return prevItemIds;

        const nextItemIds = prevItemIds.filter((_itemId) => _itemId !== itemId);
        return nextItemIds.length === prevItemIds.length ? prevItemIds : nextItemIds;
      });
    },
    [setOpenItemIds],
  );

  const removeOpenItemIds = useCallback(
    (itemIds: string[]) => {
      setOpenItemIds((prevItemIds) => {
        const nextItemIds = prevItemIds.filter((id) => !itemIds.includes(id));
        return nextItemIds.length === prevItemIds.length ? prevItemIds : nextItemIds;
      });
    },
    [setOpenItemIds],
  );

  return { openItemIds, setOpenItemIds, addOpenItemIds, removeOpenItemId, removeOpenItemIds };
}
