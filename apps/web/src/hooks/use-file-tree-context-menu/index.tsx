import React, { useCallback, useState } from "react";
import type { Model } from "flexlayout-react";
import { useAtom } from "jotai";
import { ClipboardCopy, FileEdit, FolderPlus, Trash2 } from "lucide-react";
import type { TreeItemRenderContext } from "react-complex-tree";
import { useTranslation } from "react-i18next";
import type { CoFile, CoFileTree, CoFolder } from "@/types/file";
import { deletingItemIdAtom, renamingItemIdAtom, enabledPluginsAtom } from "@/store/jotai";
import { useAddFile } from "@/hooks/use-add-file";
import { useAddFolder } from "@/hooks/use-add-folder";
import { useDeleteFile } from "@/hooks/use-delete-file";
import { useOpenItemIds } from "@/hooks/use-open-item-ids";


export interface FileTreeContextMenuItem {
  key: string;
  label?: string;
  icon?: React.ReactNode;
  onSelect?: (e: Event) => void;
  type?: "divider";
}

export function useFileTreeContextMenu() {
  const { t } = useTranslation();
  const [, setRenamingItemId] = useAtom(renamingItemIdAtom);
  const [, setDeletingItemId] = useAtom(deletingItemIdAtom);
  const { addFile } = useAddFile();
  const { addFolder } = useAddFolder();
  const { deleteFile } = useDeleteFile();
  const { removeOpenItemIds } = useOpenItemIds();
  const [enabledPlugins] = useAtom(enabledPluginsAtom);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getFileTreeContextMenu = useCallback(
    (
      item: CoFile | CoFolder,
      context: TreeItemRenderContext,
      tabModel: Model | undefined,
      fileTree: CoFileTree,
    ): FileTreeContextMenuItem[] => {
      if (!(tabModel && fileTree)) {
        return [];
      }
      const isFolder = item.type === "folder";

      const commonContextMenu = [
        {
          key: "rename",
          label: t("operation.rename"),
          icon: <FileEdit className="w-4" />,
          onSelect: (e: Event) => {
            e.stopPropagation();
            setTimeout(() => {
              context.startRenamingItem();
            }, 100);
            setRenamingItemId(item.id);
          },
        },
        {
          key: "delete",
          label: t("operation.delete"),
          icon: <Trash2 className="w-4" />,
          onSelect: (e: Event) => {
            e.stopPropagation();
            setDeletingItemId(item.id);
            setIsDialogOpen(true);
          },
        },
      ];

      if (isFolder) {
        const fileTypeItems: FileTreeContextMenuItem[] = enabledPlugins.map((plugin) => ({
          key: `add${plugin.id}`,
          label: t(plugin.meta.tooltip),
          icon: <plugin.meta.icon className="w-4" />,
          onSelect: (e: Event) => {
            e.stopPropagation();
            addFile(plugin.meta.defaultFileName, plugin.id, tabModel, item.id);
          },
        }));

        return [
          ...fileTypeItems,
          {
            key: "divider",
            type: "divider",
          },
          {
            key: "addfolder",
            label: t("operation.addFolder"),
            icon: <FolderPlus className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFolder("New Folder", item.id);
            },
          },
          ...commonContextMenu,
        ];
      } else {
        return [
          ...commonContextMenu,
          {
            key: "copy_codro_link",
            label: t("operation.copyCodroLink"),
            icon: <ClipboardCopy className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`codro://${item.id}`);
            },
          },
        ];
      }
    },
    [addFile, addFolder, setRenamingItemId, setDeletingItemId, t],
  );

  const deleteFileItem = useCallback(
    async (deleteItems: (CoFile | CoFolder)[], tabModel: Model | undefined) => {
      if (!tabModel) {
        return;
      }
      const { fileIdsToDelete: _, folderIdsToDelete } = await deleteFile(deleteItems);
      removeOpenItemIds(folderIdsToDelete);
    },
    [deleteFile, removeOpenItemIds],
  );

  return { isDialogOpen, setIsDialogOpen, getFileTreeContextMenu, deleteFileItem };
}
