import React, { useCallback, useState } from "react";
import type { Model } from "flexlayout-react";
import { useAtom } from "jotai";
import { ClipboardCopy, FileEdit, FileType, FolderPlus, Palette, Trash2 } from "lucide-react";
import type { TreeItemRenderContext } from "react-complex-tree";
import { useTranslation } from "react-i18next";
import type { CoFile, CoFileTree, CoFolder } from "@/types/file";
import { deletingItemIdAtom, renamingItemIdAtom } from "@/store/jotai";
import { useAddFile } from "@/hooks/use-add-file";
import { useAddFolder } from "@/hooks/use-add-folder";
import { useDeleteFile } from "@/hooks/use-delete-file";
import { useOpenItemIds } from "@/hooks/use-open-item-ids";
import { Icons } from "@/components/icons";

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
              context.startRenamingItem(); // need to delay execution
            }, 100);
            setRenamingItemId(item.id);
          },
        },
        {
          key: "delete",
          label: t("operation.delete"),
          icon: <Trash2 className="w-4"></Trash2>,
          onSelect: (e: Event) => {
            e.stopPropagation();
            setDeletingItemId(item.id);
            setIsDialogOpen(true);
          },
        },
      ];

      if (isFolder) {
        return [
          {
            key: "addexcalidraw",
            label: t("operation.addBoard"),
            icon: <Palette className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFile("New Excalidraw", "board", tabModel, item.id);
            },
          },
          {
            key: "addtldraw",
            label: t("operation.addTldraw"),
            icon: <Icons.tldraw className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFile("New Tldraw", "tldraw", tabModel, item.id);
            },
          },
          {
            key: "adddrawio",
            label: t("operation.addDrawio"),
            icon: <Icons.drawio className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFile("New Drawio", "drawio", tabModel, item.id);
            },
          },
          {
            key: "addmindmap",
            label: t("operation.addMindmap"),
            icon: <Icons.mindmap className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFile("New Mindmap", "mindmap", tabModel, item.id);
            },
          },
          {
            key: "addnote",
            label: t("operation.addNote"),
            icon: <FileType className="w-4" />,
            onSelect: (e: Event) => {
              e.stopPropagation();
              addFile("New Note", "note", tabModel, item.id);
            },
          },
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
      // if folder is deleted, openItems should be removed
      removeOpenItemIds(folderIdsToDelete);
    },
    [deleteFile, removeOpenItemIds],
  );

  return { isDialogOpen, setIsDialogOpen, getFileTreeContextMenu, deleteFileItem };
}
