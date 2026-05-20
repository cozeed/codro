import { DEFAULT_FILE_TREE } from "@/utils/constant";
import { generateId } from "@/lib/utils";
import { coFileRegistry } from "@/plugins/registry";

import type { CoFile, CoFileTree, CoFolder } from "../types/file";
import { getUniqueNameInSameTreeLevel } from "../utils/file";
import { BaseDb } from "./base-db";

export class FileTreeDb extends BaseDb {
  constructor(client: any) {
    super(client);
  }
  private getFileTreeId() {
    return `file_tree_${this.userId}`;
  }

  async getFileTree(): Promise<CoFileTree | null> {
    // console.time("💾 DB GetFileTree");
    const record = await super.get(this.getFileTreeId());
    // console.timeEnd("💾 DB GetFileTree");

    return (record?.data as CoFileTree) ?? null;
  }

  async updateFileTree(fileTree: CoFileTree) {
    // console.time("💾 DB UpdateFileTree");
    try {
      await super.addOrUpdate(this.getFileTreeId(), { type: "file_tree", data: fileTree, userId: this.userId });
    } catch (error) {
      console.error("💾 DB UpdateFileTree Error:", error);
    }
    // console.timeEnd("💾 DB UpdateFileTree");
    return fileTree;
  }

  async initFileTree() {
    const fileTree = await this.getFileTree();
    if (fileTree) return fileTree;
    await this.updateFileTree(DEFAULT_FILE_TREE);
  }

  async addFolder(name?: string, parentId?: string) {
    const id = `folder_${generateId()}`;
    const folderInfo: CoFolder = {
      id,
      name: name || "New Folder",
      type: "folder",
    };
    await this.addFileTreeItem(folderInfo, true, parentId);

    return folderInfo;
  }

  async addFileTreeItem(info: CoFile | CoFolder, isFolder: boolean, parentId?: string) {
    const fileTree = (await this.getFileTree()) || {};
    const pid = parentId ?? "root";
    const parentItem = fileTree[pid];
    if (!parentItem) return;

    info.name = getUniqueNameInSameTreeLevel(info, fileTree, pid);
    fileTree[info.id] = { index: info.id, isFolder, canMove: true, canRename: true, data: info };
    parentItem.children = [info.id, ...(parentItem.children || [])];

    await this.updateFileTree(fileTree);
    return info;
  }

  async addFile(name?: string, type: string = "note", parentId?: string, fileContent?: string): Promise<CoFile> {
    const fileId = `file_${generateId()}`;
    const fileInfo: CoFile = { id: fileId, name: name || "", type };

    const plugin = coFileRegistry.get(type);
    if (plugin) {
      const deserialize = plugin.data.deserialize ?? JSON.parse;
      const data = fileContent ? deserialize(fileContent) : plugin.data.getInitialData();
      await super.add({
        id: fileId,
        type,
        data,
        userId: this.userId,
      });
    }

    await this.addFileTreeItem(fileInfo, false, parentId);

    return fileInfo;
  }

  async getFile(fileId: string): Promise<CoFile | undefined> {
    const fileTree = await this.getFileTree();
    return fileTree?.[fileId]?.data as CoFile;
  }

  async deleteFileItem(fileIds: string | string[]): Promise<CoFileTree> {
    const idList = Array.isArray(fileIds) ? fileIds : [fileIds];
    const oldTree = await this.getFileTree();
    if (!oldTree) return {};

    const newTree: CoFileTree = {};
    Object.entries(oldTree).forEach(([key, item]) => {
      if (idList.includes(key)) return;

      newTree[key] = {
        ...item,
        children: item.children?.filter((childId) => !idList.includes(childId as string)),
      };
    });

    await this.updateFileTree(newTree);
    return newTree;
  }

  async updateFileOrFolderName(item: CoFolder | CoFile, name: string) {
    if (name === item.name) return;
    const fileTree = await this.getFileTree();
    if (!fileTree) return;

    let parentId: string | undefined;
    Object.values(fileTree).forEach((treeItem) => {
      if (treeItem.children?.includes(item.id)) parentId = treeItem.data.id;
    });

    const uniqueName = getUniqueNameInSameTreeLevel({ ...item, name }, fileTree, parentId);
    if (fileTree[item.id]?.data) {
      fileTree[item.id]!.data.name = uniqueName;
    }

    await this.updateFileTree(fileTree);
  }
}
