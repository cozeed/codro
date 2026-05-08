"use client";

import { useEffect, useRef, type FC } from "react";
import { useAuiState } from "@assistant-ui/react";
import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Props for the MermaidDiagram component
 */
export type MermaidDiagramProps = SyntaxHighlighterProps & {
  className?: string;
};

/**
 * MermaidDiagram component for rendering Mermaid diagrams
 * Use it by passing to `componentsByLanguage` for mermaid in `markdown-text.tsx`
 *
 * @example
 * const MarkdownTextImpl = () => {
 *   return (
 *     <MarkdownTextPrimitive
 *       remarkPlugins={[remarkGfm]}
 *       className="aui-md"
 *       components={defaultComponents}
 *       componentsByLanguage={{
 *         mermaid: {
 *           SyntaxHighlighter: MermaidDiagram
 *         },
 *       }}
 *     />
 *   );
 * };
 */
export const MermaidDiagram: FC<MermaidDiagramProps> = ({
  code,
  className,
  node: _node,
  components: _components,
  language: _language,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const ref = useRef<HTMLPreElement>(null);

  // Detect when this code block is complete
  const isComplete = useAuiState((s) => {
    if (s.part.type !== "text") return false;

    // Find the position of this code block
    const codeIndex = s.part.text.indexOf(code);
    if (codeIndex === -1) return false;

    // Check if there are closing backticks immediately after this code block
    const afterCode = s.part.text.substring(codeIndex + code.length);

    // Look for the closing backticks - should be at the start or after a newline
    const closingBackticksMatch = afterCode.match(/^```|^\n```/);
    return closingBackticksMatch !== null;
  });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
      themeVariables: {
        fontSize: "12px",
        fontFamily: "font-sans",
      },
    });
  }, [theme]);

  useEffect(() => {
    if (!isComplete) return;

    (async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, code);
        if (ref.current) {
          ref.current.innerHTML = result.svg;
          result.bindFunctions?.(ref.current);
        }
      } catch (e) {
        console.warn("Failed to render Mermaid diagram:", e);
      }
    })();
  }, [isComplete, code]);

  return (
    <pre
      ref={ref}
      className={cn("aui-mermaid-diagram bg-muted rounded-b-lg p-2 text-center [&_svg]:mx-auto", className)}
    >
      {t("operation.drawingDiagram")}
    </pre>
  );
};

MermaidDiagram.displayName = "MermaidDiagram";
