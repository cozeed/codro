"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuiState } from "@assistant-ui/react";
import { Excalidraw, THEME } from "@excalidraw/excalidraw";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { langCodeAtom } from "@/store/jotai";

import "@excalidraw/excalidraw/index.css";

type Props = {
  code?: string;
  className?: string;
};

const waitForCanvas = (container: HTMLElement): Promise<HTMLElement> => {
  return new Promise((resolve) => {
    const check = () => {
      const el = container.querySelector(".excalidraw");
      if (el) return resolve(el as HTMLElement);
      requestAnimationFrame(check);
    };
    check();
  });
};

export const ExcalidrawDiagram = ({ code = "", className }: Props) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [langCode] = useAtom(langCodeAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const isComplete = useAuiState((s) => {
    if (s.part.type !== "text") return false;
    const codeIndex = s.part.text.lastIndexOf(code);
    if (codeIndex === -1) return false;
    const afterCode = s.part.text.substring(codeIndex + code.length);
    return /^```|^\n```/.test(afterCode);
  });

  const initialData = useMemo(() => {
    if (!isComplete) return null;

    try {
      const data = JSON.parse(code);
      if (!Array.isArray(data.elements)) return null;
      return {
        elements: data.elements,
        appState: data.appState || {},
        files: data.files || {},
      };
    } catch {
      return null;
    }
  }, [code, isComplete]);

  const getLanguage = () => {
    if (langCode === "ja") return "ja-JP";
    return langCode;
  };

  useEffect(() => {
    if (!initialData) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const run = async () => {
      const el = await waitForCanvas(container);
      if (cancelled) return;

      requestAnimationFrame(() => {
        if (cancelled) return;

        el.focus();
        el.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "1",
            code: "Digit1",
            shiftKey: true,
            bubbles: true,
          }),
        );
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [initialData]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "aui-excalidraw-diagram bg-muted relative h-75 w-full overflow-hidden rounded-b-lg border",
        "flex flex-col",
        className,
      )}
    >
      {initialData && (
        <div className="h-full w-full">
          <Excalidraw
            initialData={initialData}
            viewModeEnabled
            zenModeEnabled
            langCode={getLanguage()}
            theme={theme === "dark" ? THEME.DARK : THEME.LIGHT}
            renderTopRightUI={() => null}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
                clearCanvas: false,
                export: false,
                loadScene: false,
                saveToActiveFile: false,
                toggleTheme: false,
              },
            }}
          />
        </div>
      )}
      {!initialData && <pre className="text-muted-foreground p-2 text-center">{t("operation.drawingDiagram")}</pre>}

      <style>
        {`
          .aui-excalidraw-diagram .App-bottom-bar {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};
