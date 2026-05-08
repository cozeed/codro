import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceFn } from "ahooks";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { hash } from "ohash";
import { DrawIoEmbed, type DrawIoEmbedRef, type EventAutoSave } from "react-drawio";
import type { CoFile } from "@/types/file";
import { isSavingAtom, langCodeAtom } from "@/store/jotai";
import { useCurrentFile } from "@/hooks/use-current-file";
import { useDrawioDb } from "@/hooks/use-drawio-db";
import { useDrawioQuery } from "@/hooks/use-drawio-query";
import { Spinner } from "@/components/spinner";

interface Props {
  file: CoFile;
}

export const DrawioEditor = ({ file }: Props) => {
  const { theme } = useTheme();
  const [langCode] = useAtom(langCodeAtom);
  const [, setIsSaving] = useAtom(isSavingAtom);
  const [initialData, setInitialData] = useState<string>("");
  const prevHashRef = useRef<string>("");
  const ref = useRef<DrawIoEmbedRef>(null);
  const { currentFileId } = useCurrentFile();
  const drawioDb = useDrawioDb();
  const { drawioData, isReading } = useDrawioQuery(file.id);

  const getLanguage = () => {
    if (langCode === "zh-CN") {
      return "zh";
    } else if (langCode === "zh-TW") {
      return "zh-tw";
    }
    return langCode;
  };
  // Read data
  const readData = useCallback(() => {
    const data = (drawioData as { xml?: string })?.xml ?? "";
    if (!data) return;
    const newHash = hash(data);
    if (newHash === prevHashRef.current) {
      // console.log("drawio readData: no change, skip loadSnapshot");
      return;
    }
    prevHashRef.current = newHash;

    setInitialData(data);
  }, [drawioData]);
  // Save data
  const saveData = useCallback(
    async (data: string, fileId: string) => {
      if (isReading) return;
      if (!drawioDb || !fileId) return;
      const newHash = hash(data);
      if (newHash === prevHashRef.current) {
        // console.log("drawio saveData: no change");
        return;
      }
      prevHashRef.current = newHash;

      setIsSaving(true);
      await drawioDb.updateDrawio(fileId, data);
      setIsSaving(false);
    },
    [drawioDb, isReading, setIsSaving],
  );

  useEffect(() => {
    queueMicrotask(readData);
  }, [readData]);

  const onChangeFn = useCallback(
    async (data: EventAutoSave) => {
      if (!data) return;
      // react-drawio handleEvent only checks event.origin, not event.source,
      // so ALL DrawIoEmbed instances receive postMessage events from ALL draw.io iframes.
      // Only save when this editor's file is the one currently focused by the user.
      if (currentFileId !== file.id) return;

      await saveData(data.xml, file.id);
      // Send file data change event
      ref.current?.status({ message: "✓ auto saved", modified: false });
      setTimeout(() => {
        ref.current?.status({ message: "" });
      }, 3000);
    },
    [file.id, saveData, currentFileId],
  );
  const { run: onChangeDebounceFn } = useDebounceFn(onChangeFn, {
    wait: 800,
  });
  return (
    <div className={"h-full w-full bg-[#f1f3f4] p-1.5 dark:bg-[#1b1d1e]"}>
      <div className="z-50 h-full w-full">
        <DrawIoEmbed
          key={`${file.id}-${theme}-${langCode}`}
          ref={ref}
          baseUrl="https://embed.diagrams.net/"
          autosave={true}
          urlParameters={{
            ui: theme !== "dark" ? "kennedy" : "dark",
            spin: false,
            modified: false,
            libraries: true,
            saveAndExit: false,
            noExitBtn: true,
            noSaveBtn: true,
            lang: getLanguage(),
            edit: file.id,
          }}
          xml={initialData ?? ""}
          onAutoSave={(data) => onChangeDebounceFn(data)}
        ></DrawIoEmbed>
        {isReading && (
          <div className="absolute inset-0 z-60 flex flex-col items-center justify-center bg-transparent">
            <Spinner withText />
          </div>
        )}
      </div>
    </div>
  );
};
