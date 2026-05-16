"use client";

import { useMemo } from "react";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";
import { DrawIoEmbed } from "react-drawio";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { langCodeAtom } from "@/store/jotai";

type Props = {
  code?: string;
  className?: string;
};

const isComplete = (code: string) => {
  const start = code.indexOf("<mxGraphModel");
  const end = code.indexOf("</mxGraphModel>");
  return start !== -1 && end !== -1 && end > start;
};

export const DrawioDiagram = ({ code = "", className }: Props) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [langCode] = useAtom(langCodeAtom);

  const getLanguage = () => {
    if (langCode === "zh-CN") return "zh";
    if (langCode === "zh-TW") return "zh-tw";
    return langCode;
  };

  const xml = useMemo(() => {
    if (!code) return null;
    if (!isComplete(code)) return null;
    return code;
  }, [code]);

  return (
    <div
      className={cn("aui-drawio-diagram bg-muted relative h-75 w-full overflow-hidden rounded-b-lg border", className)}
    >
      {xml ? (
        <div className="h-full w-full">
          <DrawIoEmbed
            baseUrl="https://embed.diagrams.net/"
            xml={xml}
            autosave={false}
            urlParameters={{
              ui: theme !== "dark" ? "kennedy" : "dark",
              spin: false,
              modified: false,
              libraries: false,
              chrome: false,
              noSaveBtn: true,
              noExitBtn: true,
              saveAndExit: false,
              lang: getLanguage(),
            }}
          />
        </div>
      ) : (
        <pre className="text-muted-foreground p-2 text-center">{t("operation.drawingDiagram")}</pre>
      )}
    </div>
  );
};
