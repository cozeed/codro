import { useCallback, useEffect, useMemo, useRef } from "react";
import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/shadcn";
import { useAtom } from "jotai";

// import '@blocknote/core/fonts/inter.css';
import "@blocknote/shadcn/style.css";

import { BLOCKNOTE_INITIAL_DATA } from "@/db/note-db";
import { uploadFile } from "@/services/storage-service";
import { useDebounceFn } from "ahooks";
import { useTheme } from "next-themes";
import { hash } from "ohash";
import type { CoFile } from "@/types/file";
import { isSavingAtom, langCodeAtom } from "@/store/jotai";
import { useNoteDb } from "@/hooks/use-note-db";
import { useNoteQuery } from "@/hooks/use-note-query";
import { Spinner } from "@/components/spinner";

interface Props {
  file: CoFile;
}
const getLanguage = (langCode: string) => {
  let langKey = langCode;
  if (langCode === "zh-CN") langKey = "zh";
  else if (langCode === "zh-TW") langKey = "zhTW";
  return locales[langKey as keyof typeof locales];
};

export const NoteEditor = ({ file }: Props) => {
  const { theme } = useTheme();
  const prevHashRef = useRef<string>("");
  const [langCode] = useAtom(langCodeAtom);
  const [, setIsSaving] = useAtom(isSavingAtom);
  const noteDb = useNoteDb();
  const { noteData, isReading } = useNoteQuery(file.id);

  const handleUploadFile = async (file: File) => {
    try {
      const type = "notes";
      const result = await uploadFile(file, type);
      return result.data.fileUrl;
    } catch (error) {
      console.error("uploadFile error:", error);
      throw error;
    }
  };

  // Creates a new editor instance.
  // We use useMemo + createBlockNoteEditor instead of useCreateBlockNote so we
  // can delay the creation of the editor until the initial content is loaded.
  // when language changed, create a new editor instance
  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      initialContent: BLOCKNOTE_INITIAL_DATA,
      dictionary: getLanguage(langCode),
      uploadFile: handleUploadFile,
    });
  }, [langCode]);

  // Read data
  const readData = useCallback(() => {
    if (!noteData) return;
    const newHash = hash(noteData);
    if (newHash === prevHashRef.current) {
      // console.log("note readData: no change, skip loadSnapshot");
      return;
    }

    prevHashRef.current = newHash;
    editor.replaceBlocks(editor.document, noteData as PartialBlock[]);
  }, [noteData, editor]);
  // Save data
  const saveData = useCallback(
    async (editor: BlockNoteEditor, fileId: string) => {
      if (isReading) return;
      if (!noteDb || !editor || !fileId) return;
      const jsonBlocks: PartialBlock[] = editor?.document ?? [];
      //
      const jsonBlocksTemp = JSON.parse(JSON.stringify(jsonBlocks)); // remove undefined properties
      const newHash = hash(jsonBlocksTemp);
      if (newHash === prevHashRef.current) {
        // console.log("note saveData: no change");
        return;
      }
      prevHashRef.current = newHash;
      //
      setIsSaving(true);
      await noteDb.updateNote(fileId, jsonBlocksTemp);
      setIsSaving(false);
    },
    [noteDb, isReading, setIsSaving],
  );

  // when language changed, clear prevHashRef, then readData
  useEffect(() => {
    prevHashRef.current = "";
  }, [langCode]);
  //
  useEffect(() => {
    queueMicrotask(readData);
  }, [readData]);

  const onChangeFn = useCallback(async () => {
    // If the file being edited is not the current file, the data will not be saved
    // if (currentFileId !== file.id) return;

    await saveData(editor, file.id);
  }, [editor, file.id, saveData]);

  const { run: onChangeDebounceFn } = useDebounceFn(onChangeFn, {
    wait: 500,
  });

  return (
    <div className="bg-background h-full w-full p-2">
      <BlockNoteView
        key={`${file.id}-${langCode}`}
        theme={theme as "light" | "dark"}
        editor={editor}
        onChange={onChangeDebounceFn}
        className="h-full w-full"
      />
      {isReading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent">
          <Spinner withText />
        </div>
      )}
    </div>
  );
};
