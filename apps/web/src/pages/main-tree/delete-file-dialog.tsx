import { useEffect, useState } from "react";
import type { Model } from "flexlayout-react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import type { CoFile, CoFileTree, CoFolder } from "@/types/file";
import { deletingItemIdAtom } from "@/store/jotai";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  fileTree: CoFileTree;
  selectedItemIds: string[];
  tabModel?: Model;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (items: (CoFile | CoFolder)[], tabModel?: Model) => Promise<void>;
}

export const DeleteFileDialog = ({ fileTree, selectedItemIds, tabModel, open, onOpenChange, onDelete }: Props) => {
  const { t } = useTranslation();
  const [deletingItemId] = useAtom(deletingItemIdAtom);
  const [selectedItems, setSelectedItems] = useState<(CoFile | CoFolder)[]>([]);

  useEffect(() => {
    // If selectedItemIds count <= 1, use deletingItemId as the selected item
    const tempIds = selectedItemIds.length <= 1 ? [deletingItemId] : selectedItemIds;
    //
    const selected = (tempIds?.map((key) => fileTree[key]?.data).filter(Boolean) ?? []) as (CoFile | CoFolder)[];
    queueMicrotask(() => setSelectedItems(selected));
  }, [fileTree, selectedItemIds, deletingItemId]);

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <ConfirmDialog
      title="Codro"
      description={`${t("confirm.confirmDelete")} ${selectedItems.map((item) => item.name).join(", ")}?`}
      open={open}
      onOpenChange={onOpenChange}
      onOk={async () => {
        onOpenChange(false);
        await onDelete(selectedItems, tabModel);
      }}
      onCancel={() => onOpenChange(false)}
    />
  );
};
