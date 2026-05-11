"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import { memo, useState, type FC } from "react";
import {
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
  type CodeHeaderProps,
} from "@assistant-ui/react-markdown";
import { BlockNoteEditor } from "@blocknote/core";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { processBoardCode } from "@/lib/process-board";
import { DrawioDiagram } from "@/components/assistant-ui/drawio-diagram";
import { ExcalidrawDiagram } from "@/components/assistant-ui/excalidraw-diagram";
import { MermaidDiagram } from "@/components/assistant-ui/mermaid-diagram";
import { MindMapDiagram } from "@/components/assistant-ui/mind-map-diagram";
import { NoteDiagram } from "@/components/assistant-ui/note-diagram";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={defaultComponents}
      componentsByLanguage={{
        mermaid: {
          SyntaxHighlighter: MermaidDiagram,
        },
        board: {
          SyntaxHighlighter: ExcalidrawDiagram,
        },
        drawio: {
          SyntaxHighlighter: DrawioDiagram,
        },
        mindmap: {
          SyntaxHighlighter: MindMapDiagram,
        },
        note: {
          SyntaxHighlighter: NoteDiagram,
        },
      }}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { t } = useTranslation();
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = async () => {
    if (!code || isCopied) return;
    let content = code;

    if (language === "note") {
      try {
        const parsed = JSON.parse(code);
        const editor = BlockNoteEditor.create({ initialContent: parsed });
        content = editor.blocksToMarkdownLossy(editor.document);
      } catch {
        /* JSON parse failed, fall back to raw code */
      }
    } else if (language === "board") {
      const result = processBoardCode(code);
      if (result) {
        content = JSON.stringify({
          type: "excalidraw/clipboard",
          ...result,
        });
      }
    }

    copyToClipboard(content);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
      <span className="lowercase [&>span]:text-xs">{language}</span>
      <TooltipIconButton tooltip={t("operation.copy")} onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  );
};

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1 className={cn("mb-5 text-3xl font-bold tracking-tight", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <h2 className={cn("mt-5 mb-3 text-2xl font-semibold tracking-tight", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-4 mb-3 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <h4 className={cn("mt-4 mb-3 text-lg font-semibold tracking-tight", className)} {...props} />
  ),
  h5: ({ className, ...props }) => <h5 className={cn("my-3 text-base font-semibold", className)} {...props} />,
  h6: ({ className, ...props }) => <h6 className={cn("my-3 text-sm font-semibold", className)} {...props} />,
  p: ({ className, ...props }) => <p className={cn("my-1 text-sm leading-normal", className)} {...props} />,
  a: ({ className, ...props }) => (
    <a className={cn("text-primary text-sm font-medium underline underline-offset-4", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote className={cn("border-l-2 pl-4 text-sm italic", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-3 ml-5 list-disc text-sm [&>li]:mt-1", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-3 ml-5 list-decimal text-sm [&>li]:mt-1", className)} {...props} />
  ),
  hr: ({ className, ...props }) => <hr className={cn("my-4 border-b", className)} {...props} />,
  table: ({ className, ...props }) => (
    <table
      className={cn("my-4 w-full border-separate border-spacing-0 overflow-x-auto text-sm", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-muted px-3 py-2 text-left text-sm font-semibold first:rounded-tl-lg last:rounded-tr-lg [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l px-3 py-2 text-left text-sm last:border-r [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => <tr className={cn("m-0 border-b p-0 first:border-t", className)} {...props} />,
  sup: ({ className, ...props }) => (
    <sup className={cn("text-xs [&>a]:text-xs [&>a]:no-underline", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn("overflow-x-auto rounded-t-none rounded-b-lg bg-black p-3 text-xs text-white", className)}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code className={cn("text-xs", !isCodeBlock && "bg-muted rounded border font-semibold", className)} {...props} />
    );
  },
  CodeHeader,
});
