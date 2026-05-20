"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceFn } from "ahooks";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { hash } from "ohash";
import { useTranslation } from "react-i18next";
import MindMap from "simple-mind-map";
import Themes from "simple-mind-map-plugin-themes";
import themeList from "simple-mind-map-plugin-themes/themeList";
import AssociativeLine from "simple-mind-map/src/plugins/AssociativeLine.js";
import Drag from "simple-mind-map/src/plugins/Drag.js";
import Export from "simple-mind-map/src/plugins/Export.js";
import KeyboardNavigation from "simple-mind-map/src/plugins/KeyboardNavigation.js";
import MiniMap from "simple-mind-map/src/plugins/MiniMap.js";
import NodeImgAdjust from "simple-mind-map/src/plugins/NodeImgAdjust.js";
import OuterFrame from "simple-mind-map/src/plugins/OuterFrame.js";
import Painter from "simple-mind-map/src/plugins/Painter.js";
import RainbowLines from "simple-mind-map/src/plugins/RainbowLines.js";
import RichText from "simple-mind-map/src/plugins/RichText.js";
import Search from "simple-mind-map/src/plugins/Search.js";
import Select from "simple-mind-map/src/plugins/Select.js";
import TouchEvent from "simple-mind-map/src/plugins/TouchEvent.js";
import Watermark from "simple-mind-map/src/plugins/Watermark.js";
import type { CoFile } from "@/types/file";
import { isSavingAtom } from "@/store/jotai";
import { useFileDb } from "@/hooks/use-file-db";
import { useFileQuery } from "@/hooks/use-file-query";
import { Spinner } from "@/components/spinner";

import { MainToolbar } from "./components/main-toolbar";
import { NodeStyleToolbar } from "./components/node-style-toolbar";
import { RichTextToolbar } from "./components/rich-text-toolbar";

// Register plugins
/* eslint-disable react-hooks/rules-of-hooks */
MindMap.usePlugin(RichText);
MindMap.usePlugin(AssociativeLine);
MindMap.usePlugin(Select);
MindMap.usePlugin(Drag);
MindMap.usePlugin(KeyboardNavigation);
MindMap.usePlugin(Export);
MindMap.usePlugin(MiniMap);
MindMap.usePlugin(Watermark);
MindMap.usePlugin(TouchEvent);
MindMap.usePlugin(NodeImgAdjust);
MindMap.usePlugin(Search);
MindMap.usePlugin(Painter);
MindMap.usePlugin(RainbowLines);
MindMap.usePlugin(OuterFrame);

// Register themes
Themes.init(MindMap);

interface Props {
  file: CoFile;
}

export const MindMapEditor = ({ file }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return <MindMapEditorContent key={`${file.id}-${isDark ? "dark" : "light"}-${lang}`} file={file} isDark={isDark} />;
};

/**
 * inner component
 */
const MindMapEditorContent = ({ file, isDark }: { file: CoFile; isDark: boolean }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement | null>(null);
  const [initialData, setInitialData] = useState<Record<string, any> | undefined>();
  const prevHashRef = useRef<string>("");
  const [editor, setEditor] = useState<MindMap | null>(null);
  const [, setIsSaving] = useAtom(isSavingAtom);
  const fileDb = useFileDb();
  const { fileData, isReading } = useFileQuery(file.id);
  const defaultInsertSecondLevelNodeText = t("operation.mindBranchTopic");
  const defaultInsertBelowSecondLevelNodeText = t("operation.mindSubTopic");
  const defaultGeneralizationText = t("operation.mindSummary");

  // Read data
  const readData = useCallback(() => {
    if (!fileData) return;
    const newHash = hash(fileData);
    if (newHash === prevHashRef.current) {
      // console.log("mindmap readData: no change, skip loadSnapshot");
      return;
    }
    prevHashRef.current = newHash;

    setInitialData(fileData);
  }, [fileData]);

  // Save data
  const saveData = useCallback(
    async (editor: MindMap | null, fileId: string) => {
      if (isReading) return;
      if (!fileDb || !editor || !fileId) return;

      const originData = {
        ...editor.getData(true),
      };
      const newHash = hash(originData);
      if (newHash === prevHashRef.current) {
        // console.log("mindmap saveData: no change");
        return;
      }
      prevHashRef.current = newHash;
      setIsSaving(true);
      await fileDb.update(fileId, { data: originData });
      setIsSaving(false);
    },
    [fileDb, isReading, setIsSaving],
  );

  const onChangeFn = useCallback(async () => {
    // If the file being edited is not the current file, the data will not be saved
    // if (currentFileId !== file.id) return;
    await saveData(editor, file.id);
  }, [editor, file.id, saveData]);

  const { run: onChangeDebounceFn } = useDebounceFn(onChangeFn, {
    wait: 500,
  });
  const getTheme = (theme: any, isDark: boolean) => {
    const defaultTheme = { template: isDark ? "blackGold" : "gold", config: {} };
    if (!theme?.template || !theme?.config) return defaultTheme;

    const themeListAll = [
      {
        name: "Default theme",
        value: "default",
        dark: false,
      },
      ...themeList,
    ];
    const themeItem = themeListAll.find((item) => item.dark === isDark && item.value === theme.template);
    if (!themeItem) return defaultTheme;
    return theme;
  };
  // init MindMap
  const initMindMap = useCallback(() => {
    if (!initialData || !ref.current) return;
    if (editor) return;

    const { root, layout, theme, view } = initialData;

    const themeTemp = getTheme(theme, isDark);
    const mindMapInstance = new MindMap({
      el: ref.current,
      data: root,
      viewData: view,
      layout,
      theme: themeTemp.template,
      themeConfig: themeTemp.config,
      defaultInsertSecondLevelNodeText,
      defaultInsertBelowSecondLevelNodeText,
      defaultGeneralizationText,
      rainbowLinesConfig: {
        open: false,
        colorsList: [
          "rgb(255, 213, 73)",
          "rgb(255, 136, 126)",
          "rgb(107, 225, 141)",
          "rgb(151, 171, 255)",
          "rgb(129, 220, 242)",
          "rgb(255, 163, 125)",
          "rgb(152, 132, 234)",
        ],
      },
      enableAutoEnterTextEditWhenKeydown: true,
    } as any);

    // Add class to SVG container to avoid blank area on resize
    mindMapInstance.svg.addClass("w-full h-full");

    setEditor(mindMapInstance);

    // Bind event listeners after initialization
    setTimeout(() => {
      mindMapInstance.on("data_change", () => onChangeDebounceFn());
      mindMapInstance.on("view_data_change", () => onChangeDebounceFn());
      mindMapInstance.on("view_theme_change", () => onChangeDebounceFn());
    }, 200);
  }, [
    editor,
    initialData,
    onChangeDebounceFn,
    defaultInsertSecondLevelNodeText,
    defaultInsertBelowSecondLevelNodeText,
    defaultGeneralizationText,
    isDark,
  ]);

  useEffect(() => {
    if (!editor || !initialData) return;

    const { root, layout, theme, view } = initialData;
    const themeTemp = getTheme(theme, isDark);

    editor.setFullData({
      root,
      layout,
      theme: themeTemp.template,
      themeConfig: themeTemp.config,
      view,
    });
  }, [initialData, editor, isDark]);

  useEffect(() => {
    queueMicrotask(readData);
  }, [readData]);

  // init MindMap
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          initMindMap();
          observer.disconnect();
        }
      }
    });
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [initMindMap]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="z-50 h-full w-full"></div>

      {editor && (
        <div className="absolute top-2 left-2 flex gap-2">
          <MainToolbar editor={editor} />
          <NodeStyleToolbar editor={editor} />
        </div>
      )}

      {editor && <RichTextToolbar editor={editor} className="" />}
      {isReading && (
        <div className="absolute inset-0 z-60 flex flex-col items-center justify-center bg-transparent">
          <Spinner withText />
        </div>
      )}
    </div>
  );
};
