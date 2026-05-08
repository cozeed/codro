import React, { useCallback, useEffect, useState } from "react";
import { isEqual } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import {
  Layout,
  TabNode,
  type Action,
  type BorderNode,
  type IJsonModel,
  type ITabRenderValues,
  type Model,
  type TabSetNode,
} from "flexlayout-react";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import type { CoFile, CoFileType } from "@/types/file";
import { cn, computeMenuPosition } from "@/lib/utils";
import { langCodeAtom, tabJsonModelAtom } from "@/store/jotai";
import { useCurrentFile } from "@/hooks/use-current-file";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { useTabJsonModel } from "@/hooks/use-tab-json-model";

import { FileTabContextMenu } from "./file-tab-context-menu";
import { getFileTypeEditor, getFileTypeIcon } from "./file-type";

import "flexlayout-react/style/combined.css";
import "./index.css";

interface ContextMenuData {
  node: TabNode | TabSetNode | BorderNode | null;
  x: number;
  y: number;
  menuItems: string[];
}

const MainTabs = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { fileTreeData } = useFileTreeQuery();
  const [langCode] = useAtom(langCodeAtom);
  const { tabModel, updateTab, deleteTab, updateTabName, renameTab } = useTabJsonModel();
  const { setCurrentFile } = useCurrentFile();
  const [tabJsonModel, setTabJsonModel] = useAtom(tabJsonModelAtom);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData>({
    node: null,
    x: 0,
    y: 0,
    menuItems: [],
  });
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

  // update tabModel
  useEffect(() => {
    updateTab(tabJsonModel);
  }, [updateTab, tabJsonModel]);
  // update tab name when langCode change
  useEffect(() => {
    updateTabName(tabModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langCode, updateTabName]);
  useEffect(() => {
    if (!tabModel || isEmpty(fileTreeData)) return;
    const fileMap = new Map(Object.values(fileTreeData).map((item) => [item.data.id, item.data]));
    tabModel.visitNodes((node) => {
      if (node instanceof TabNode) {
        const file = node.getConfig();
        if (!file) return;
        const latest = fileMap.get(file.id);
        if (!latest) return;
        if (node.getName() === latest.name) return;
        renameTab(file.id, latest.name, tabModel);
      }
    });
  }, [fileTreeData, tabModel, renameTab]);
  useEffect(() => {
    if (!tabModel || isEmpty(fileTreeData)) return;
    const validFileIds = new Set(Object.values(fileTreeData).map((item) => item.data.id));
    const tabsToDelete: string[] = [];

    tabModel.visitNodes((node) => {
      if (node instanceof TabNode) {
        const file = node.getConfig();
        if (!file || file.id === "welcome") return;
        if (!validFileIds.has(file.id)) {
          tabsToDelete.push(node.getId());
        }
      }
    });
    if (tabsToDelete.length === 0) return;
    (async () => {
      for (const tabId of tabsToDelete) {
        await deleteTab(tabId, tabModel);
      }
    })();
  }, [fileTreeData, tabModel, deleteTab]);

  const renderContent = (file: CoFile) => {
    return getFileTypeEditor(file);
  };

  const factory = useCallback(
    (node: TabNode) => {
      const file = node.getConfig(); // file info saved in config
      const refreshKey = refreshKeys[file.id] ?? 0;
      return (
        <div key={refreshKey} className="tab_content">
          {renderContent(file)}
        </div>
      );
    },
    [refreshKeys],
  );

  const onTabDelete = useCallback(
    (fileId: string, model: Model | undefined) => {
      deleteTab(fileId, model);
    },
    [deleteTab],
  );

  const onTabSelect = useCallback(
    async (fileId: string, model: Model | undefined) => {
      if (!model) return;
      // set current file
      setCurrentFile(fileId);
    },
    [setCurrentFile],
  );

  const onAction = useCallback(
    (action: Action) => {
      if (!tabModel) return;

      switch (action.type) {
        case "FlexLayout_DeleteTab":
          onTabDelete(action.data.node, tabModel);
          break;
        case "FlexLayout_SelectTab":
          onTabSelect(action.data.tabNode, tabModel);
          break;
      }
      return action;
    },
    [tabModel, onTabSelect, onTabDelete],
  );

  const onRenderTab = useCallback((node: TabNode, renderValues: ITabRenderValues) => {
    const fileType: CoFileType = node.getConfig()?.type;
    const leading = getFileTypeIcon(fileType);
    renderValues.leading = leading;
  }, []);

  const onModelChange = useCallback(
    (model: Model, _action: Action) => {
      if (isEqual(tabJsonModel, model?.toJson())) {
        return;
      }
      setTabJsonModel(model.toJson() as IJsonModel);
    },
    [tabJsonModel, setTabJsonModel],
  );

  // refresh tab content
  const handleRefresh = useCallback((tabId: string) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [tabId]: (prev[tabId] ?? 0) + 1,
    }));
  }, []);
  // right click menu event
  const onContextMenu = useCallback(
    (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      // calculate menu position
      const container = document.querySelector(".flexlayout__layout") ?? document.documentElement;
      const { x, y } = computeMenuPosition(event.clientX, event.clientY, 120, 130, container);
      setContextMenuData({
        node,
        x,
        y,
        menuItems: [
          t("operation.close"),
          t("operation.closeOther"),
          t("operation.closeRight"),
          t("operation.closeAll"),
          "separator",
          t("operation.refresh"),
        ],
      });
      setContextMenuOpen(true);
    },
    [t],
  );
  // select menu item
  const onSelectMenu = useCallback(
    (node: TabNode | TabSetNode | BorderNode | null, item: string) => {
      if (!(node instanceof TabNode)) return;
      const parent = node.getParent();

      const toDelete: TabNode[] = [];

      if (item === t("operation.close")) {
        toDelete.push(node);
      } else if (item === t("operation.closeOther")) {
        parent?.getChildren().forEach((n) => {
          if (n instanceof TabNode && n !== node) {
            toDelete.push(n);
          }
        });
      } else if (item === t("operation.closeRight")) {
        const children = parent?.getChildren() ?? [];
        const index = children.findIndex((n) => n === node);
        for (let i = index + 1; i < children.length; i++) {
          const n = children[i];
          if (n instanceof TabNode) {
            toDelete.push(n);
          }
        }
      } else if (item === t("operation.closeAll")) {
        parent?.getChildren().forEach((n) => {
          if (n instanceof TabNode) {
            toDelete.push(n);
          }
        });
      } else if (item === t("operation.refresh")) {
        const file = node.getConfig();
        if (file?.id) handleRefresh(file.id);
      }

      toDelete.forEach((tab) => {
        onTabDelete(tab.getId(), tabModel);
      });

      setContextMenuOpen(false);
    },
    [onTabDelete, tabModel, t, handleRefresh],
  );

  return tabModel ? (
    <div className={cn("h-full w-full", theme === "dark" ? "flexlayout__theme_dark" : "flexlayout__theme_light")}>
      <Layout
        model={tabModel}
        factory={factory}
        onAction={onAction}
        onRenderTab={onRenderTab}
        onModelChange={onModelChange}
        onContextMenu={onContextMenu}
      />

      <FileTabContextMenu
        node={contextMenuData.node}
        x={contextMenuData.x}
        y={contextMenuData.y}
        menuItems={contextMenuData.menuItems}
        open={contextMenuOpen}
        onOpenChange={setContextMenuOpen}
        onSelect={onSelectMenu}
      />
    </div>
  ) : null;
};

export default MainTabs;
