import { useCallback } from "react";
import type { CoFile, CoFileTree, CoFolder } from "@/types/file";
import { useFileTreeDb } from "@/hooks/use-file-tree-db";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";

/**
 * get all children ids of a folder
 */
function getChildren(treeItemId: string, tree: CoFileTree, children: string[] = []): string[] {
  const _children = tree[treeItemId]?.children || [];
  children = [...children, ..._children] as string[];

  for (const childId of _children) {
    if (tree[childId]?.children) {
      const nestedChildren = getChildren(childId as string, tree, children);
      children = [...children, ...nestedChildren];
    }
  }

  return Array.from(new Set(children));
}
/**
 * get all file and folder ids under a folder
 */
function getFileFolderIds(
  folders: CoFolder | CoFolder[],
  tree: CoFileTree,
): {
  fileIds: string[];
  folderIds: string[];
} {
  const folderList = Array.isArray(folders) ? folders : [folders];
  const fileIds: string[] = [];
  const folderIds: string[] = [];

  for (const folder of folderList) {
    const childrenIds = getChildren(folder.id, tree, []);

    for (const id of childrenIds) {
      if (id.startsWith("file_")) {
        fileIds.push(id);
      } else if (id.startsWith("folder_")) {
        folderIds.push(id);
      }
    }

    // contain folder id
    folderIds.push(folder.id);
  }

  return {
    fileIds: Array.from(new Set(fileIds)),
    folderIds: Array.from(new Set(folderIds)),
  };
}

export function useDeleteFile() {
  const fileTreeDb = useFileTreeDb();
  const { fileTreeData } = useFileTreeQuery();

  const deleteFile = useCallback(
    async (deleteItems: (CoFile | CoFolder)[], tx?: typeof fileTreeDb) => {
      const db = tx ?? fileTreeDb!;
      // filter files and folders
      const files = deleteItems.filter((item) => item.id.startsWith("file_")) as CoFile[];
      const folders = deleteItems.filter((item) => item.id.startsWith("folder_")) as CoFolder[];
      const fileIdsTemp1 = files.map((file) => file.id);
      const { fileIds: fileIdsTemp2, folderIds: folderIdsTemp } = getFileFolderIds(folders, fileTreeData);
      //
      const fileIdsToDelete: string[] = Array.from(new Set([...fileIdsTemp1, ...fileIdsTemp2]));
      const folderIdsToDelete: string[] = Array.from(new Set([...folderIdsTemp]));

      // delete file data
      await db.delete(fileIdsToDelete);
      // delete file tree nodes
      await db.deleteFileItem([...fileIdsToDelete, ...folderIdsToDelete]);

      return { fileIdsToDelete, folderIdsToDelete };
    },
    [fileTreeDb, fileTreeData],
  );

  return { deleteFile };
}
