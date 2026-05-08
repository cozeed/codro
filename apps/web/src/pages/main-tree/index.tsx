import React, { useCallback, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { Folder, FolderOpen, MoreVertical } from "lucide-react";
import { useTheme } from "next-themes";
import type {
  DraggingPosition,
  DraggingPositionBetweenItems,
  DraggingPositionItem,
  TreeItem,
  TreeItemIndex,
  TreeItemRenderContext} from "react-complex-tree";
import {
  ControlledTreeEnvironment,
  Tree
} from "react-complex-tree";
import type { CoFile, CoFileTree, CoFolder } from "@/types/file";
import { cn, computeMenuPosition } from "@/lib/utils";
import { deletingItemIdAtom, focusItemIdAtom, renamingItemIdAtom, selectedItemIdsAtom } from "@/store/jotai";
import { useCurrentFile } from "@/hooks/use-current-file";
import type { FileTreeContextMenuItem} from "@/hooks/use-file-tree-context-menu";
import { useFileTreeContextMenu } from "@/hooks/use-file-tree-context-menu";
import { useFileTreeDb } from "@/hooks/use-file-tree-db";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { useOpenItemIds } from "@/hooks/use-open-item-ids";
import { useTabJsonModel } from "@/hooks/use-tab-json-model";
import { Spinner } from "@/components/spinner";

import { getFileTypeIcon } from "../main-tabs/file-type";
import { DeleteFileDialog } from "./delete-file-dialog";
import { FileTreeContextMenu } from "./file-tree-context-menu";

import "react-complex-tree/lib/style-modern.css";
import "./index.css";

// file tree context menu data
interface FileTreeContextMenuData {
  itemId: string;
  x: number;
  y: number;
  menuItems: FileTreeContextMenuItem[];
}

interface TreeInteractiveWrapperProps {
  isRenaming: boolean;
  contextProps?: React.HTMLProps<any>;
  className?: string;
  children: React.ReactNode;
}

const TreeInteractiveWrapper = ({ isRenaming, contextProps, className, children }: TreeInteractiveWrapperProps) => {
  if (isRenaming) {
    return (
      <div {...contextProps} className={className}>
        {children}
      </div>
    );
  }
  return (
    <button {...contextProps} type="button" className={className}>
      {children}
    </button>
  );
};

export const MainTree = () => {
  const { theme } = useTheme();
  const fileTreeDb = useFileTreeDb();
  const [selectedItemIds, setSelectedItemIds] = useAtom(selectedItemIdsAtom);
  const [focusItemId, setFocusItemId] = useAtom(focusItemIdAtom);
  const [renamingItemId, setRenamingItemId] = useAtom(renamingItemIdAtom);
  const [deletingItemId, setDeletingItemId] = useAtom(deletingItemIdAtom);
  const [hoveredItemId, setHoveredItemId] = useState(""); // hovered item id
  const [menuedItemId, setMenuedItemId] = useState(""); // menued item id
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<FileTreeContextMenuData>({
    itemId: "",
    x: 0,
    y: 0,
    menuItems: [],
  });

  const { fileTreeData, isReading } = useFileTreeQuery();
  const { openItemIds, addOpenItemIds, removeOpenItemId } = useOpenItemIds();
  const { updateTabOnFileChange, tabModel } = useTabJsonModel();
  const { setCurrentFile } = useCurrentFile();
  const { isDialogOpen, setIsDialogOpen, getFileTreeContextMenu, deleteFileItem } = useFileTreeContextMenu();

  const viewState = useMemo(
    () => ({
      ["codro-file-tree"]: {
        selectedItems: selectedItemIds,
        expandedItems: openItemIds,
        focusedItem: focusItemId,
      },
    }),
    [selectedItemIds, openItemIds, focusItemId],
  );

  const onExpandItem = useCallback(
    (item: TreeItem) => {
      addOpenItemIds([item.data.id]);
    },
    [addOpenItemIds],
  );

  const onCollapseItem = useCallback(
    (item: TreeItem<CoFolder | CoFile>) => {
      removeOpenItemId(item.data.id);
    },
    [removeOpenItemId],
  );

  const onSelectItems = useCallback(
    async (items: TreeItemIndex[]) => {
      if (items.length === 1) {
        const itemId = items[0] as string;
        if (itemId.startsWith("file_")) {
          const file = fileTreeData[itemId]?.data as CoFile;
          if (!file) return;
          setCurrentFile(file.id);
          updateTabOnFileChange(file, tabModel);
          return;
        }
      }

      setSelectedItemIds(items as string[]);
    },
    [fileTreeData, tabModel, setCurrentFile, updateTabOnFileChange, setSelectedItemIds],
  );

  const onFocusItem = useCallback(
    (item: TreeItem) => {
      const itemId = item.data.id;
      // update focusItemId
      setFocusItemId(itemId);
    },
    [setFocusItemId],
  );

  const onRenameItem = useCallback(
    async (item: TreeItem<CoFile | CoFolder>, name: string) => {
      await fileTreeDb?.updateFileOrFolderName(item.data, name);

      setRenamingItemId("");
    },
    [fileTreeDb, setRenamingItemId],
  );

  const clearTargetInChildren = useCallback((itemIds: string[], tree: CoFileTree) => {
    // clear target item from all children
    Object.keys(tree).forEach((key) => {
      const treeItem = tree[key];
      if (!treeItem) {
        return;
      }
      treeItem.children = treeItem.children?.filter((child) => !itemIds.includes(String(child)));
    });

    return tree;
  }, []);

  const onDropBetweenItems = useCallback(
    (items: TreeItem<CoFile | CoFolder>[], target: DraggingPositionBetweenItems, prevTree: CoFileTree): CoFileTree => {
      const newFileTree: CoFileTree = JSON.parse(JSON.stringify(prevTree));

      const itemIds: string[] = items.map((item) => item.data.id).filter(Boolean);

      // clear target item from all children
      clearTargetInChildren(itemIds, newFileTree);
      const prevTargetTreeItem = prevTree[target.parentItem];
      const targetTreeItem = newFileTree[target.parentItem];
      if (!targetTreeItem) {
        return newFileTree;
      }
      const targetChildren = targetTreeItem.children || [];

      // check if items are same parent
      const sameParent = items.every((item) => prevTargetTreeItem?.children?.includes(item.data.id));

      let insertIndex = target.childIndex;

      if (sameParent) {
        // update insert index to avoid order change
        const oldIndices = itemIds.map((id) => prevTargetTreeItem?.children?.indexOf(id) ?? -1);
        oldIndices.forEach((oldIndex) => {
          if (oldIndex >= 0 && oldIndex < target.childIndex) {
            insertIndex -= 1;
          }
        });
      }

      // insert items to target parent
      const newChildren = [...targetChildren.slice(0, insertIndex), ...itemIds, ...targetChildren.slice(insertIndex)];

      targetTreeItem.children = newChildren;

      return newFileTree;
    },
    [clearTargetInChildren],
  );

  const onDropItem = useCallback(
    (items: TreeItem<CoFile | CoFolder>[], target: DraggingPositionItem, prevTree: CoFileTree): CoFileTree => {
      const newFileTree: CoFileTree = JSON.parse(JSON.stringify(prevTree));

      const itemIds: string[] = items.map((item) => item.data.id).filter((id) => !!id);
      clearTargetInChildren(itemIds, newFileTree);
      const targetTreeItem = newFileTree[target.targetItem];
      if (!targetTreeItem) {
        return newFileTree;
      }
      const children = targetTreeItem.children || [];
      const newChildren = [...itemIds, ...children];

      targetTreeItem.children = newChildren;

      return newFileTree;
    },
    [clearTargetInChildren],
  );

  const onDrop = useCallback(
    async (items: TreeItem<CoFile | CoFolder>[], target: DraggingPosition) => {
      let newFileTree: CoFileTree | null = null;

      switch (target.targetType) {
        case "between-items":
          // console.log("onDropBetweenItems", items, target, fileTreeData);
          newFileTree = onDropBetweenItems(items, target, fileTreeData);
          break;
        case "item":
          // console.log("onDropItem", items, target, fileTreeData);
          newFileTree = onDropItem(items, target, fileTreeData);
          break;
        case "root":
          break;
      }

      if (newFileTree) {
        await fileTreeDb?.updateFileTree(newFileTree);
        console.log("onDrop result", newFileTree);
      }
    },
    [fileTreeData, onDropBetweenItems, onDropItem, fileTreeDb],
  );

  const showMenu = useCallback((x: number, y: number, itemId: string, contextMenuItems: FileTreeContextMenuItem[]) => {
    const container = document.documentElement;
    const menuWidth = 210;
    const menuHeight = contextMenuItems.length * 30 + 9;
    const { x: xTemp, y: yTemp } = computeMenuPosition(x, y, menuWidth, menuHeight, container);
    setContextMenuData({
      itemId,
      x: xTemp,
      y: yTemp,
      menuItems: contextMenuItems,
    });
    setMenuedItemId(itemId);
    setContextMenuOpen(true);
  }, []);
  const getTreeItemIcon = useCallback((item: TreeItem, depth: number, context: TreeItemRenderContext) => {
    if (item.isFolder) {
      // top level folder icon（depth === 0）
      if (depth === 0) {
        return (
          <div className="relative">
            {context.isExpanded ? <FolderOpen className="size-4" /> : <Folder className="size-4" />}
            <span className="absolute right-0 bottom-0 h-1.25 w-1.25 rounded-full bg-amber-500 dark:bg-amber-500" />
          </div>
        );
      } else {
        // other level folder icon
        return context.isExpanded ? <FolderOpen className="size-4" /> : <Folder className="size-4" />;
      }
    }
    // file icon
    return getFileTypeIcon(item.data.type);
  }, []);

  const renderTitleItem = useCallback(
    (item: TreeItem, depth: number, context: TreeItemRenderContext, title: React.ReactNode) => {
      return (
        <div className="w-[calc(100%-1.5rem)]">
          <div
            className={`tree-item-child pointer-events-auto flex items-center ${item.data.id}`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setTimeout(() => {
                context.startRenamingItem(); // Needs delayed execution
              }, 100);
              setRenamingItemId(item.data.id);
              // setRenamingItemId(item.data.id);
              // context.startRenamingItem();
            }}
            onBlur={(e) => {
              e.stopPropagation();
              if (renamingItemId) {
                const target = e.target as HTMLInputElement;
                onRenameItem(item, target.value);
              }
            }}
          >
            <div className="items-center">
              {getTreeItemIcon(item, depth, context)}
              {/* {item.isFolder ?
                (!context.isExpanded ? (<Folder className="size-4" />) : (<FolderOpen className="size-4" />)) :
                (getFileTypeIcon(item.data.type))} */}
            </div>
            <div className="ml-2 flex-1 items-center truncate pr-2 text-sm">{title}</div>
          </div>
        </div>
      );
    },
    [renamingItemId, onRenameItem, setRenamingItemId, getTreeItemIcon],
  );
  const renderMoreItem = useCallback(
    (item: TreeItem, contextMenuItems: FileTreeContextMenuItem[]) => {
      return (
        <div
          className="pointer-events-auto flex h-6 w-6 items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            // if item is not selected, add to selected item ids
            if (!selectedItemIds.includes(item.data.id)) {
              setSelectedItemIds([item.data.id]);
            }
            //
            const el = document.querySelector(`[data-rct-item-id="${item.data.id}"]`);
            if (!el) {
              return;
            }
            const rect = el.getBoundingClientRect();
            showMenu(rect.right, rect.top, item.data.id, contextMenuItems);
          }}
        >
          {(hoveredItemId === item.data.id || menuedItemId === item.data.id || deletingItemId === item.data.id) && (
            <MoreVertical className="h-3 w-3 cursor-pointer text-gray-500 dark:text-gray-300" />
          )}
        </div>
      );
    },
    [hoveredItemId, menuedItemId, deletingItemId, selectedItemIds, setSelectedItemIds, showMenu],
  );

  return (
    <div
      className="h-[calc(100vh-(2.5rem+2.5rem))] max-h-[calc(100vh-(2.5rem+2.5rem))] w-full"
      onDragOver={(e) => e.stopPropagation()}
      onDragLeave={(e) => e.stopPropagation()}
    >
      <div
        className={cn(
          theme === "dark" && "rct-dark",
          "h-full w-full overflow-x-hidden overflow-y-auto border-slate-100 px-1 pt-0 pb-8",
        )}
      >
        <ControlledTreeEnvironment
          items={fileTreeData}
          getItemTitle={(item) => `${item?.data.name}`}
          viewState={viewState}
          canDragAndDrop={true}
          canDropOnFolder={true}
          canDropOnNonFolder={false}
          canDropBelowOpenFolders={true}
          canReorderItems={true}
          canRename={true}
          canSearch={true}
          onSelectItems={onSelectItems}
          onExpandItem={onExpandItem}
          onCollapseItem={onCollapseItem}
          onFocusItem={onFocusItem}
          onDrop={onDrop}
          onRenameItem={onRenameItem}
          // defaultInteractionMode={...}
          renderTreeContainer={({ children, containerProps }) => (
            <div {...(containerProps as React.HTMLProps<HTMLDivElement>)}>{children}</div>
          )}
          renderItemsContainer={({ children, containerProps }) => (
            <ul {...(containerProps as React.HTMLProps<HTMLUListElement>)}>{children}</ul>
          )}
          renderItem={({ item, depth, children, title, context, arrow, info }) => {
            const contextMenuItems = getFileTreeContextMenu(item.data, context, tabModel, fileTreeData) || [];

            const onContextMenu = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              // if item is not selected, add to selected item ids
              if (!selectedItemIds.includes(item.data.id)) {
                setSelectedItemIds([item.data.id]);
              }
              showMenu(e.clientX, e.clientY, item.data.id, contextMenuItems);
            };

            return (
              <li
                {...(context.itemContainerWithChildrenProps as React.HTMLProps<HTMLLIElement>)}
                className="rct-tree-item-li"
              >
                <div
                  {...(context.itemContainerWithoutChildrenProps as React.HTMLProps<HTMLDivElement>)}
                  style={{ paddingLeft: `${(depth + 1) * 0.5}rem` }}
                  className={cn(
                    "rct-tree-item-title-container",
                    item.isFolder && "rct-tree-item-title-container-isFolder",
                    context.isSelected && "rct-tree-item-title-container-selected",
                    context.isExpanded && "rct-tree-item-title-container-expanded",
                    context.isFocused && "rct-tree-item-title-container-focused",
                    context.isDraggingOver && "rct-tree-item-title-container-dragging-over",
                    context.isSearchMatching && "rct-tree-item-title-container-search-match",
                    (menuedItemId == item.data.id || deletingItemId == item.data.id) &&
                      "rct-tree-item-title-container-dragging-over",
                  )}
                  onMouseEnter={() => setHoveredItemId(item.data.id)} // set hoveredItem
                  onMouseLeave={() => setHoveredItemId("")} // set hoveredItem
                  onContextMenu={onContextMenu}
                >
                  {arrow}
                  <TreeInteractiveWrapper
                    isRenaming={context.isRenaming!}
                    contextProps={context.interactiveElementProps}
                    className="rct-tree-item-button flex items-center justify-between"
                  >
                    {renderTitleItem(item, depth, context, title)}
                    {!info.isRenaming && renderMoreItem(item, contextMenuItems)}
                  </TreeInteractiveWrapper>
                </div>
                {children}
              </li>
            );
          }}
        >
          <Tree treeId="codro-file-tree" rootItem="root" treeLabel="FileTree" />
        </ControlledTreeEnvironment>
      </div>
      {isReading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
          <Spinner withText />
        </div>
      )}
      <FileTreeContextMenu
        x={contextMenuData.x}
        y={contextMenuData.y}
        menuItems={contextMenuData.menuItems}
        open={contextMenuOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMenuedItemId("");
          }
          setContextMenuOpen(open);
        }}
      />
      <DeleteFileDialog
        fileTree={fileTreeData}
        selectedItemIds={selectedItemIds}
        tabModel={tabModel}
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingItemId("");
          }
          setIsDialogOpen(open);
        }}
        onDelete={deleteFileItem}
      />
    </div>
  );
};
