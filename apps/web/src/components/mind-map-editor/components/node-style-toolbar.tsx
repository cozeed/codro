import { useCallback, useEffect, useRef, useState } from "react";
import { useClickAway, useKeyPress } from "ahooks";
import i18n from "i18next";
import { Bold, CaseUpper, Highlighter, Italic, Strikethrough, Underline } from "lucide-react";
import { useTranslation } from "react-i18next";
import type MindMap from "simple-mind-map";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/tooltip";

import { alignList, fontFamilyList } from "../config";
import { fontSizeList } from "../config/constant";
import { ColorPicker } from "./color-picker";
import { FontFamilyMenu } from "./font-family-menu";
import { FontSizeMenu } from "./font-size-menu";
import { TextAlignMenu } from "./text-align-menu";

interface Props {
  className?: string;
  editor: MindMap;
}

export const NodeStyleToolbar = ({ className, editor }: Props) => {
  const { t } = useTranslation();

  const [activeNodes, setActiveNodes] = useState<any[]>([]);
  const [formatInfo, setFormatInfo] = useState<Record<string, any>>({});
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fontFamilyListOptions = fontFamilyList[i18n.language as keyof typeof fontFamilyList];
  const alignListOptions = alignList[i18n.language as keyof typeof alignList];

  const [isFontFamilyOpen, setIsFontFamilyOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isTextAlignOpen, setIsTextAlignOpen] = useState(false);
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isBackgroundColorOpen, setIsBackgroundColorOpen] = useState(false);
  const isDisabled = activeNodes.length === 0;

  // Initialize node style
  const initNodeStyle = useCallback((nodes: any[]) => {
    if (nodes.length == 0) {
      setFormatInfo({});
      return;
    }
    const keys = [
      "color",
      "fontFamily",
      "fontSize",
      "textDecoration",
      "fontWeight",
      "fontStyle",
      "fillColor",
      "textAlign",
    ];

    const node = nodes[0];
    const newFormat: Record<string, any> = {};
    keys.forEach((key) => {
      newFormat[key] = node.getStyle(key, false);
    });

    setFormatInfo(newFormat);
  }, []);

  const onNodeActive = useCallback(
    (_node: unknown, nodes: any[]) => {
      setActiveNodes(nodes);
      initNodeStyle(nodes);
    },
    [initNodeStyle],
  );

  const closeOtherToolbars = (except: string) => {
    queueMicrotask(() => {
      if (except !== "fontFamily") setIsFontFamilyOpen(false);
      if (except !== "fontSize") setIsFontSizeOpen(false);
      if (except !== "textAlign") setIsTextAlignOpen(false);
      if (except !== "textColor") setIsTextColorOpen(false);
      if (except !== "backgroundColor") setIsBackgroundColorOpen(false);
    });
  };

  useEffect(() => {
    editor.on("node_active", onNodeActive);
    return () => {
      editor.off("node_active", onNodeActive);
    };
  }, [editor, onNodeActive]);
  useEffect(() => {
    if (isFontFamilyOpen) closeOtherToolbars("fontFamily");
  }, [isFontFamilyOpen]);

  useEffect(() => {
    if (isFontSizeOpen) closeOtherToolbars("fontSize");
  }, [isFontSizeOpen]);

  useEffect(() => {
    if (isTextAlignOpen) closeOtherToolbars("textAlign");
  }, [isTextAlignOpen]);

  useEffect(() => {
    if (isTextColorOpen) closeOtherToolbars("textColor");
  }, [isTextColorOpen]);

  useEffect(() => {
    if (isBackgroundColorOpen) closeOtherToolbars("backgroundColor");
  }, [isBackgroundColorOpen]);

  useKeyPress("esc", () => {
    closeOtherToolbars("");
  });

  useClickAway(() => {
    closeOtherToolbars("");
  }, toolbarRef);

  const updateNodeStyle = useCallback(
    (prop: string, value: any) => {
      activeNodes.forEach((node) => {
        node.setStyle(prop, value);
      });
      setFormatInfo({ ...formatInfo, [prop]: value });
    },
    [activeNodes, formatInfo],
  );

  const toggleBold = () => {
    updateNodeStyle("fontWeight", formatInfo.fontWeight === "bold" ? "normal" : "bold");
  };

  const toggleItalic = () => {
    updateNodeStyle("fontStyle", formatInfo.fontStyle === "italic" ? "normal" : "italic");
  };

  const toggleUnderline = () => {
    updateNodeStyle("textDecoration", formatInfo.textDecoration === "underline" ? "none" : "underline");
  };

  const toggleStrike = () => {
    updateNodeStyle("textDecoration", formatInfo.textDecoration === "line-through" ? "none" : "line-through");
  };

  const changeFontFamily = (font: string) => updateNodeStyle("fontFamily", font);

  const changeFontSize = (size: number) => updateNodeStyle("fontSize", size);

  const changeTextColor = (color: string) => updateNodeStyle("color", color);

  const changeBackgroundColor = (backgroundColor: string) => updateNodeStyle("fillColor", backgroundColor);

  const changeTextAlign = (textAlign: string) => updateNodeStyle("textAlign", textAlign);

  return (
    <div
      ref={toolbarRef}
      className={cn("toolbar-container bg-background flex items-center space-x-1.5 rounded-lg border p-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bold */}
      <Tooltip content={t("mindmap.richTextToolbar.bold")} delay={0} side="bottom">
        <Button
          variant="outline"
          disabled={isDisabled}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center ${formatInfo.fontWeight === "bold" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleBold}
        >
          <Bold className="size-5" />
        </Button>
      </Tooltip>

      {/* Italic */}
      <Tooltip content={t("mindmap.richTextToolbar.italic")} delay={0} side="bottom">
        <Button
          variant="outline"
          disabled={isDisabled}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center ${formatInfo.fontStyle === "italic" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleItalic}
        >
          <Italic className="size-5" />
        </Button>
      </Tooltip>

      {/* Underline */}
      <Tooltip content={t("mindmap.richTextToolbar.underline")} delay={0} side="bottom">
        <Button
          variant="outline"
          disabled={isDisabled}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center ${formatInfo.textDecoration === "underline" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleUnderline}
        >
          <Underline className="size-5" />
        </Button>
      </Tooltip>

      {/* Strike */}
      <Tooltip content={t("mindmap.richTextToolbar.strike")} delay={0} side="bottom">
        <Button
          variant="outline"
          disabled={isDisabled}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center ${formatInfo.textDecoration === "line-through" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleStrike}
        >
          <Strikethrough className="size-5" />
        </Button>
      </Tooltip>

      {/* Font Family */}
      <FontFamilyMenu
        open={isFontFamilyOpen}
        disabled={isDisabled}
        fontFamilyListOptions={fontFamilyListOptions}
        currentFontFamily={formatInfo.fontFamily}
        onFontFamilyChange={changeFontFamily}
        onOpenChange={setIsFontFamilyOpen}
      />

      {/* Font Size */}
      <FontSizeMenu
        open={isFontSizeOpen}
        disabled={isDisabled}
        fontSizeListOptions={fontSizeList}
        currentFontSize={`${formatInfo.fontSize}px`}
        onFontSizeChange={changeFontSize}
        onOpenChange={setIsFontSizeOpen}
      />

      {/* Font Color */}
      <ColorPicker
        tooltipContent={t("mindmap.richTextToolbar.color")}
        IconComponent={CaseUpper}
        open={isTextColorOpen}
        disabled={isDisabled}
        currentColor={formatInfo.color}
        onColorChange={changeTextColor}
        onOpenChange={setIsTextColorOpen}
      />

      {/* Background Color */}
      <ColorPicker
        tooltipContent={t("mindmap.richTextToolbar.backgroundColor")}
        IconComponent={Highlighter}
        open={isBackgroundColorOpen}
        disabled={isDisabled}
        currentColor={formatInfo.fillColor}
        onColorChange={changeBackgroundColor}
        onOpenChange={setIsBackgroundColorOpen}
      />

      {/* Text Align */}
      <TextAlignMenu
        open={isTextAlignOpen}
        disabled={isDisabled}
        textAlignListOptions={alignListOptions}
        currentTextAlign={formatInfo.textAlign}
        onTextAlignChange={changeTextAlign}
        onOpenChange={setIsTextAlignOpen}
      />
    </div>
  );
};
