"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuiState } from "@assistant-ui/react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import MindMap from "simple-mind-map";
import Themes from "simple-mind-map-plugin-themes";
import themeList from "simple-mind-map-plugin-themes/themeList";
import Drag from "simple-mind-map/src/plugins/Drag.js";
import MiniMap from "simple-mind-map/src/plugins/MiniMap.js";
import { cn } from "@/lib/utils";

import "@blocknote/shadcn/style.css";

MindMap["usePlugin"](MiniMap);
MindMap["usePlugin"](Drag);
Themes.init(MindMap);

type Props = {
  code?: string;
  className?: string;
};

export const MindMapDiagram = ({ code = "", className }: Props) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MindMap | null>(null);

  const isDark = theme === "dark";

  const isComplete = useAuiState((s) => {
    if (s.part.type !== "text") return false;

    const codeIndex = s.part.text.lastIndexOf(code);
    if (codeIndex === -1) return false;

    const afterCode = s.part.text.substring(codeIndex + code.length);

    return /^```|^\n```/.test(afterCode);
  });

  const data = useMemo(() => {
    if (!isComplete) return null;

    try {
      const parsed = JSON.parse(code);

      if (!parsed?.simpleMindMap || !Array.isArray(parsed.data)) {
        return null;
      }

      return {
        root: parsed.data[0],
        layout: parsed.layout,
        theme: parsed.theme,
        view: parsed.view,
      };
    } catch {
      return null;
    }
  }, [code, isComplete]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    const getTheme = (themeData: any) => {
      const defaultTheme = {
        template: isDark ? "blackGold" : "default",
        config: {},
      };
      if (!themeData?.template) return defaultTheme;
      const allThemes = [{ value: "default", dark: false }, ...themeList];
      const found = allThemes.find((t) => t.value === themeData.template && t.dark === isDark);
      return found ? themeData : defaultTheme;
    };

    const themeTemp = getTheme(data.theme);

    const instance = new MindMap({
      el: containerRef.current,
      data: data.root,
      layout: data.layout,
      viewData: data.view,
      theme: themeTemp.template,
      themeConfig: themeTemp.config,
      readonly: true,
      enableAutoEnterTextEditWhenKeydown: false,
    } as any);

    instance.svg.addClass("w-full h-full");
    instanceRef.current = instance;

    setTimeout(() => {
      instance.view.fit();
    }, 200);

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, [data, isDark]);

  return (
    <div
      className={cn("aui-mindmap-diagram bg-muted relative h-75 w-full overflow-hidden rounded-b-lg border", className)}
    >
      {data ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <pre className="text-muted-foreground p-2 text-center">{t("operation.drawingDiagram")}</pre>
      )}
    </div>
  );
};
