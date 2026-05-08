import { DEFAULT_FILE_TREE } from "@/utils/constant";
import { generateId } from "@/lib/utils";
import { getBoardDb } from "@/hooks/use-board-db";
import { getDrawioDb } from "@/hooks/use-drawio-db";
import { getMindmapDb } from "@/hooks/use-mindmap-db";
import { getNoteDb } from "@/hooks/use-note-db";
import { getTldrawDb } from "@/hooks/use-tldraw-db";

import type { CoFile, CoFileTree, CoFileType, CoFolder } from "../types/file";
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

  async addFile(name?: string, type: CoFileType = "note", parentId?: string, fileContent?: string): Promise<CoFile> {
    const fileId = `file_${generateId()}`;
    const fileInfo: CoFile = { id: fileId, name: name || "", type };

    if (type === "board") {
      await getBoardDb(this.client, this.userId).addBoard(fileId, fileContent ? JSON.parse(fileContent) : undefined);
    } else if (type === "tldraw") {
      await getTldrawDb(this.client, this.userId).addTldraw(fileId, fileContent ? JSON.parse(fileContent) : undefined);
    } else if (type === "drawio") {
      await getDrawioDb(this.client, this.userId).addDrawio(fileId, fileContent || undefined);
    } else if (type === "mindmap") {
      await getMindmapDb(this.client, this.userId).addMind(fileId, fileContent ? JSON.parse(fileContent) : undefined);
    } else if (type === "note") {
      await getNoteDb(this.client, this.userId).addNote(fileId, fileContent ? JSON.parse(fileContent) : undefined);
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
