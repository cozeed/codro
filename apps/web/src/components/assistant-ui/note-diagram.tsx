"use client";

import { useEffect, useMemo } from "react";
import { BLOCKNOTE_INITIAL_DATA } from "@/db/note-db";
import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import { BlockNoteView } from "@blocknote/shadcn";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { langCodeAtom } from "@/store/jotai";

import "@blocknote/shadcn/style.css";

type Props = {
  code?: string;
  className?: string;
};

const isComplete = (code?: string): boolean => {
  if (!code) return false;

  try {
    const parsed = JSON.parse(code);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

const getLanguage = (langCode: string) => {
  let langKey = langCode;
  if (langCode === "zh-CN") langKey = "zh";
  else if (langCode === "zh-TW") langKey = "zhTW";
  return locales[langKey as keyof typeof locales];
};

export const NoteDiagram = ({ code = "", className }: Props) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [langCode] = useAtom(langCodeAtom);

  const blocks = useMemo<PartialBlock[] | null>(() => {
    if (!isComplete(code)) return null;

    try {
      return JSON.parse(code);
    } catch {
      return null;
    }
  }, [code]);

  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      initialContent: BLOCKNOTE_INITIAL_DATA,
      dictionary: getLanguage(langCode),
    });
  }, [langCode]);

  useEffect(() => {
    if (!blocks) return;
    queueMicrotask(() => {
      editor.replaceBlocks(editor.document, blocks);
    });
  }, [blocks, editor]);

  return (
    <div
      className={cn(
        "aui-note-diagram bg-muted relative h-75 w-full overflow-auto rounded-none rounded-b-lg border",
        className,
      )}
    >
      {blocks ? (
        <div className="pointer-events-none h-full w-full">
          <BlockNoteView editor={editor} editable={false} theme={theme as "light" | "dark"} className="h-full w-full" />
        </div>
      ) : (
        <pre className="text-muted-foreground p-2 text-center">{t("operation.drawingDiagram")}</pre>
      )}
    </div>
  );
};
