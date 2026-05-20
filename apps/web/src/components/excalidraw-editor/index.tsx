"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import "@excalidraw/excalidraw/index.css";

import { Excalidraw, FONT_FAMILY, hashElementsVersion, THEME } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { useDebounceFn } from "ahooks";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import type { CoFile } from "@/types/file";
import { isSavingAtom, langCodeAtom } from "@/store/jotai";
import { useFileDb } from "@/hooks/use-file-db";
import { useFileQuery } from "@/hooks/use-file-query";
import { Spinner } from "@/components/spinner";

interface Props {
  file: CoFile;
}

export const ExcalidrawEditor = ({ file }: Props) => {
  const { theme } = useTheme();
  const [initialData, setInitialData] = useState<ExcalidrawInitialDataState>();
  const [langCode] = useAtom(langCodeAtom);
  const [, setIsSaving] = useAtom(isSavingAtom);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const prevVersionRef = useRef(0); // Previous version hash
  const fileDb = useFileDb();
  const { fileData, isReading } = useFileQuery(file.id);

  const uiOptions = {
    canvasActions: {
      changeViewBackgroundColor: true,
      toggleTheme: true,
    },
  };
  // Clear deleted elements
  const clearDeletedElements = useCallback((data: ExcalidrawInitialDataState) => {
    data.elements = data.elements?.filter((element) => !element.isDeleted);
    return data;
  }, []);

  const getLanguage = () => {
    if (langCode === "ja") {
      return "ja-JP";
    }
    return langCode;
  };
  // Read data
  const readData = useCallback(() => {
    if (!fileData) return;

    let initialDataTemp: ExcalidrawInitialDataState = { ...fileData };
    clearDeletedElements(initialDataTemp);
    //
    const curVersionRef = hashElementsVersion(initialDataTemp.elements ?? []);
    if (curVersionRef === prevVersionRef.current) {
      // console.log(`readData: no change, skip setInitialData`);
      return;
    }
    prevVersionRef.current = curVersionRef;
    //
    initialDataTemp = {
      ...initialDataTemp,
      appState: {
        ...initialDataTemp.appState,
        collaborators: new Map(),
        currentItemFontFamily: FONT_FAMILY.Excalifont,
        theme: theme === "dark" ? THEME.DARK : THEME.LIGHT,
      },
    };

    setInitialData(initialDataTemp);
  }, [fileData, theme, clearDeletedElements]);

  // Save data
  const saveData = useCallback(
    async (elements: ExcalidrawElement[], appState: AppState, binaryFiles: BinaryFiles, fileId: string) => {
      if (isReading) return;
      if (!fileDb || !fileId) return;
      //
      const curVersionRef = hashElementsVersion(elements);
      if (curVersionRef === prevVersionRef.current) {
        return;
      }
      prevVersionRef.current = curVersionRef;
      //
      const _data: ExcalidrawInitialDataState = {
        type: "excalidraw",
        version: 2,
        source: window.location.href,
        elements,
        appState: {
          ...appState,
          contextMenu: null, // clear context menu
        },
        files: binaryFiles,
      };
      setIsSaving(true);
      await fileDb.update(fileId, { data: _data });
      setIsSaving(false);
    },
    [fileDb, isReading, setIsSaving],
  );

  const onChangeFn = useCallback(
    async (excalidrawElements: ExcalidrawElement[], appState: AppState, binaryFiles: BinaryFiles) => {
      // If the file being edited is not the current file, the data will not be saved
      // if (currentFileId !== file.id) return;
      // If the element being edited is a text, linear text, rotation, resizing, dragging, or cropping element, the data will not be saved
      if (
        appState.editingTextElement ||
        appState.editingLinearElement ||
        appState.isRotating ||
        appState.isResizing ||
        appState.selectedElementsAreBeingDragged ||
        appState.isCropping
      ) {
        return;
      }
      saveData(excalidrawElements, appState, binaryFiles, file.id);
    },
    [file.id, saveData],
  );

  const { run: onChangeDebounceFn } = useDebounceFn(onChangeFn, {
    wait: 500,
  });

  const sanitizeAppState = (state: Partial<AppState>): AppState => {
    return {
      ...state,
      contextMenu: state.contextMenu ?? null,
      showWelcomeScreen: state.showWelcomeScreen ?? false,
    } as AppState;
  };

  useEffect(() => {
    queueMicrotask(readData);
  }, [readData]);

  useEffect(() => {
    excalidrawAPI?.updateScene({
      elements: initialData?.elements || [],
      appState: sanitizeAppState(initialData?.appState || {}),
    });
  }, [excalidrawAPI, initialData]);

  return (
    <div className="relative h-full min-h-0 w-full bg-transparent">
      {initialData && (
        <Excalidraw
          // key={`${file.id}-${theme}-${langCode}`}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          langCode={getLanguage()}
          theme={theme == "dark" ? THEME.DARK : THEME.LIGHT}
          gridModeEnabled={false}
          UIOptions={uiOptions}
          name={file.name}
          initialData={initialData}
          onChange={onChangeDebounceFn}
        />
      )}
      {isReading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
          <Spinner withText />
        </div>
      )}
    </div>
  );
};
