import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceFn } from "ahooks";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { hash } from "ohash";
import {
  createTLStore,
  defaultShapeUtils,
  getSnapshot,
  loadSnapshot,
  Tldraw,
  type Editor,
  type TLEditorSnapshot,
} from "tldraw";
import type { CoFile } from "@/types/file";
import { isSavingAtom, langCodeAtom } from "@/store/jotai";
import { useFileDb } from "@/hooks/use-file-db";
import { useFileQuery } from "@/hooks/use-file-query";
import { Spinner } from "@/components/spinner";

import "tldraw/tldraw.css";

interface Props {
  file: CoFile;
}

export const TldrawEditor = ({ file }: Props) => {
  const { theme } = useTheme();
  const [langCode] = useAtom(langCodeAtom);
  const [, setIsSaving] = useAtom(isSavingAtom);
  const [editor, setEditor] = useState<Editor>();
  const prevHashRef = useRef<string>("");
  const fileDb = useFileDb();
  const { fileData, isReading } = useFileQuery(file.id);
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));

  // Read data
  const readData = useCallback(() => {
    if (!fileData) return;
    const snapshot = fileData as TLEditorSnapshot;
    const newHash = hash(snapshot);
    if (newHash === prevHashRef.current) {
      // console.log("tldraw readData: no change, skip loadSnapshot");
      return;
    }
    prevHashRef.current = newHash;
    loadSnapshot(store, snapshot);
    //
  }, [store, fileData]);

  // Save data
  const saveData = useCallback(
    async (editor: Editor, fileId: string) => {
      if (isReading) return;
      if (!fileDb || !editor || !fileId) return;
      //
      const snapshot = getSnapshot(editor.store);
      if (!snapshot) return;
      //
      const newHash = hash(snapshot);
      if (newHash === prevHashRef.current) {
        // console.log("tldraw saveData,no change");
        return;
      }

      prevHashRef.current = newHash;
      //
      setIsSaving(true);
      await fileDb.update(fileId, { data: snapshot });
      setIsSaving(false);
    },
    [fileDb, isReading, setIsSaving],
  );

  const onChangeFn = useCallback(
    async (editor: Editor) => {
      // If the file being edited is not the current file, the data will not be saved
      // if (currentFileId !== file.id) return;
      //
      await saveData(editor, file.id);
    },
    [file.id, saveData],
  );

  const { run: onChangeDebounceFn } = useDebounceFn(onChangeFn, {
    wait: 500,
  });

  useEffect(() => {
    queueMicrotask(readData);
  }, [readData]);

  useEffect(() => {
    editor?.store?.listen(
      () => {
        onChangeDebounceFn(editor, file.id);
      },
      { scope: "document" },
    );
  }, [editor, file.id, onChangeDebounceFn]);
  useEffect(() => {
    if (!editor) return;
    editor.user.updateUserPreferences({
      colorScheme: theme === "dark" ? "dark" : "light",
      locale: langCode.toLowerCase(),
    });
  }, [theme, editor, langCode]);

  return (
    <div className="h-full w-full">
      <Tldraw
        store={store}
        autoFocus
        onUiEvent={(_name, _data) => {
          // console.log('--- onUiEvent ---', name, data);
        }}
        onMount={(editor) => {
          setEditor(editor);
        }}
      />
      {isReading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
          <Spinner withText />
        </div>
      )}
    </div>
  );
};
