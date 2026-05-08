import { useCallback } from "react";
import { SETTING_FILE, WELCOME_FILE } from "@/utils/constant";
import { isEqual } from "es-toolkit";
import {
  Actions,
  DockLocation,
  Model,
  type IJsonModel,
  type IJsonRowNode,
  type IJsonTabNode,
  type IJsonTabSetNode,
} from "flexlayout-react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import type { CoFile } from "@/types/file";
import { tabModelAtom } from "@/store/jotai";

import { useCurrentFile } from "../use-current-file";

interface TabItem {
  id: string;
  type: "tab";
  name: string;
  component?: string;
  config?: CoFile;
}

export function useTabJsonModel() {
  const { t } = useTranslation();
  const [tabModel, setTabModel] = useAtom(tabModelAtom);
  const { setCurrentFile } = useCurrentFile();

  const getTabList = useCallback(
    (node: IJsonRowNode | IJsonTabSetNode | IJsonTabNode, tabList: IJsonTabNode[] = []): IJsonTabNode[] => {
      const traverse = (node: IJsonRowNode | IJsonTabSetNode | IJsonTabNode, tabList: IJsonTabNode[]) => {
        if (node.type === "tab") {
          tabList.push(node);
        } else if ("children" in node && Array.isArray(node.children)) {
          node.children.forEach((child) => traverse(child, tabList));
        }
      };

      traverse(node, tabList);
      return tabList;
    },
    [],
  );

  const getTabItemName = useCallback(
    (file: CoFile) => {
      if (!file) return "";
      let tabItemName = file.name;
      if (file.type === "welcome") {
        tabItemName = t("text.welcomePage");
      } else if (file.type === "setting") {
        tabItemName = t("text.settingPage");
      }
      return tabItemName;
    },
    [t],
  );

  const getTabItem = useCallback(
    (file: CoFile) => {
      if (!file) return null;
      const tabItemName = getTabItemName(file);
      const newTabItem: TabItem = {
        id: file.id,
        name: tabItemName,
        type: "tab",
        component: file.type,
        config: file,
      };
      return newTabItem;
    },
    [getTabItemName],
  );
  const ensureTabListNotEmpty = useCallback(
    (tabJsonModel: IJsonModel): boolean => {
      try {
        const tabList = getTabList(tabJsonModel.layout);

        if (!tabList || tabList.length === 0) {
          const tabset = tabJsonModel.layout.children?.[0] as IJsonTabSetNode | undefined;
          if (!tabset) return false;
          if (!tabset.children) tabset.children = [];
          const newTabItem = getTabItem(WELCOME_FILE) as IJsonTabNode;
          tabset.children.push(newTabItem);

          tabset.selected = 0;
          return true;
        }
      } catch (err) {
        console.warn(err);
      }
      return false;
    },
    [getTabList, getTabItem],
  );

  const updateTab = useCallback(
    (tabJsonModel: IJsonModel) => {
      setTabModel((prev) => {
        if (!tabJsonModel) return prev;
        ensureTabListNotEmpty(tabJsonModel);
        if (!isEqual(tabJsonModel, prev?.toJson())) {
          return Model.fromJson(tabJsonModel);
        }
        return prev;
      });
    },
    [ensureTabListNotEmpty, setTabModel],
  );

  const getActiveTabset = useCallback((tabJsonModel: IJsonModel): IJsonTabSetNode => {
    const layoutChildren = tabJsonModel.layout.children as IJsonTabSetNode[];

    let activeTabset: IJsonTabSetNode = layoutChildren[0]!;

    for (const child of layoutChildren) {
      if (child.active) {
        activeTabset = child;
        break;
      }
    }

    return activeTabset;
  }, []);

  const getSelectedTab = useCallback((tabJsonModel: IJsonModel): IJsonTabNode | undefined => {
    const layoutChildren = tabJsonModel.layout.children as IJsonTabSetNode[];

    let selectedTab: IJsonTabNode | undefined = layoutChildren[0]?.children?.[0];

    for (const child of layoutChildren) {
      if (child.active) {
        selectedTab = child.children?.[child.selected || 0];
        break;
      }
    }

    return selectedTab;
  }, []);

  const addTab = useCallback(
    (file: CoFile, model: Model | undefined) => {
      if (!model) return;
      const newTabItem = getTabItem(file);
      if (!newTabItem) return;
      const json = model.toJson();

      const activeTabset = getActiveTabset(json);

      model.doAction(Actions.addTab(newTabItem as IJsonTabNode, activeTabset.id || "", DockLocation.CENTER, 0, true));
    },
    [getActiveTabset, getTabItem],
  );

  const updateTabOnFileChange = useCallback(
    (currentFile: CoFile | undefined | null, tabModel: Model | undefined) => {
      if (!currentFile || !tabModel) return;

      const tabJsonModel = tabModel.toJson();
      const tabList = getTabList(tabJsonModel.layout);

      const _tabIndex = tabList.findIndex((tab) => tab.id === currentFile.id);

      if (_tabIndex < 0) {
        addTab(currentFile, tabModel);
      } else {
        tabModel.doAction(Actions.selectTab(currentFile.id));
      }
    },
    [getTabList, addTab],
  );

  const switchToWelcomePage = useCallback(
    (tabModel: Model | undefined) => {
      if (!tabModel) return;

      const json = tabModel.toJson();
      const tabList = json && getTabList(json.layout);

      const welcomeTab = tabList?.find((tab) => tab.config.type === "welcome");

      if (welcomeTab?.id) {
        tabModel.doAction(Actions.selectTab(welcomeTab.id));
      } else {
        addTab(WELCOME_FILE, tabModel);
      }
    },
    [getTabList, addTab],
  );

  const switchToSettingPage = useCallback(
    (tabModel: Model | undefined) => {
      if (!tabModel) return;

      const json = tabModel.toJson();
      const tabList = json && getTabList(json.layout);

      const settingTab = tabList?.find((tab) => tab.config.type === "setting");

      if (settingTab?.id) {
        tabModel.doAction(Actions.selectTab(settingTab.id));
      } else {
        addTab(SETTING_FILE, tabModel);
      }
    },
    [getTabList, addTab],
  );

  const deleteTab = useCallback(
    async (fileIds: string | string[], model: Model | undefined) => {
      if (!model) return;

      const idList = Array.isArray(fileIds) ? fileIds : [fileIds];
      for (const id of idList) {
        model.doAction(Actions.deleteTab(id));
      }
      // Update the current selected tab
      const newTabJsonModel = model.toJson();
      const selectedTab = getSelectedTab(newTabJsonModel);
      const currentFileId = selectedTab?.id;
      setCurrentFile(currentFileId || "");
    },
    [getSelectedTab, setCurrentFile],
  );

  const renameTab = useCallback((fileId: string, name: string, model: Model | undefined) => {
    if (!model) return;

    model.doAction(Actions.renameTab(fileId, name));
  }, []);

  // tab name update for welcome and setting tab when langCode change
  const updateTabName = useCallback(
    (tabModel: Model | undefined) => {
      if (!tabModel) return;
      const json = tabModel.toJson();
      const tabList = json && getTabList(json.layout);
      const welcomeTab = tabList?.find((tab) => tab.config.type === "welcome");
      const settingTab = tabList?.find((tab) => tab.config.type === "setting");
      // welcome tab name update
      if (welcomeTab?.id) {
        const tabItemName = getTabItemName(welcomeTab.config as CoFile);
        renameTab(welcomeTab.id, tabItemName, tabModel);
      }
      // setting tab name update
      if (settingTab?.id) {
        const tabItemName = getTabItemName(settingTab.config as CoFile);
        renameTab(settingTab.id, tabItemName, tabModel);
      }
    },
    [renameTab, getTabItemName, getTabList],
  );

  return {
    tabModel,
    ensureTabListNotEmpty,
    updateTab,
    addTab,
    switchToWelcomePage,
    switchToSettingPage,
    updateTabOnFileChange,
    deleteTab,
    renameTab,
    updateTabName,
    getTabList,
  };
}
