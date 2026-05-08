import { useCallback, useEffect, useState } from "react";
import { useKeyPress } from "ahooks";
import i18n from "i18next";
import { Bold, CaseUpper, Eraser, Highlighter, Italic, Strikethrough, Underline } from "lucide-react";
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

export const RichTextToolbar = ({ className, editor }: Props) => {
  const { t } = useTranslation();
  const [, setTextColor] = useState<string>("");
  const [, setBackgroundColor] = useState<string>("");
  const [formatInfo, setFormatInfo] = useState<Record<string, any>>({});
  const [showRichTextToolbar, setShowRichTextToolbar] = useState<boolean>(false);
  const [style, setStyle] = useState<Record<string, any>>({ left: 0, top: 0 });

  const fontFamilyListOptions = fontFamilyList[i18n.language as keyof typeof fontFamilyList];
  const alignListOptions = alignList[i18n.language as keyof typeof alignList];
  const [isFontFamilyOpen, setIsFontFamilyOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isTextAlignOpen, setIsTextAlignOpen] = useState(false);
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isBackgroundColorOpen, setIsBackgroundColorOpen] = useState(false);

  const onRichTextSelectionChange = useCallback((hasRange: boolean, rect: any, formatInfo: any) => {
    if (hasRange) {
      setStyle({
        left: rect.left + rect.width / 2 + "px",
        top: rect.top - 60 + "px",
      });
      setFormatInfo({ ...formatInfo });
    }
    setShowRichTextToolbar(hasRange);
  }, []);
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
    // Listen rich_text_selection_change event
    editor.on("rich_text_selection_change", onRichTextSelectionChange);

    return () => {
      editor.off("rich_text_selection_change", onRichTextSelectionChange);
    };
  }, [editor, onRichTextSelectionChange]);

  useEffect(() => {
    if (!showRichTextToolbar) {
      closeOtherToolbars("");
    }
  }, [showRichTextToolbar]);

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
    if (showRichTextToolbar) {
      setShowRichTextToolbar(false);
    }
  });

  const toggleBold = () => {
    const newBold = !formatInfo.bold;
    setFormatInfo({ ...formatInfo, bold: newBold });
    editor.richText.formatText({ bold: newBold });
  };

  const toggleItalic = () => {
    const newItalic = !formatInfo.italic;
    setFormatInfo({ ...formatInfo, italic: newItalic });
    editor.richText.formatText({ italic: newItalic });
  };

  const toggleUnderline = () => {
    const newUnderline = !formatInfo.underline;
    setFormatInfo({ ...formatInfo, underline: newUnderline });
    editor.richText.formatText({ underline: newUnderline });
  };

  const toggleStrike = () => {
    const newStrike = !formatInfo.strike;
    setFormatInfo({ ...formatInfo, strike: newStrike });
    editor.richText.formatText({ strike: newStrike });
  };

  const changeFontFamily = (font: string) => {
    setFormatInfo({ ...formatInfo, font });
    editor.richText.formatText({ font });
  };

  const changeFontSize = (size: number) => {
    setFormatInfo({ ...formatInfo, size });
    editor.richText.formatText({ size: `${size}px` });
  };

  const changeTextColor = (color: string) => {
    setTextColor(color);
    setFormatInfo({ ...formatInfo, color });
    editor.richText.formatText({ color });
  };

  const changeBackgroundColor = (background: string) => {
    setBackgroundColor(background);
    setFormatInfo({ ...formatInfo, background });
    editor.richText.formatText({ background });
  };

  const changeTextAlign = (align: string) => {
    setFormatInfo({ ...formatInfo, align });
    editor.richText.formatText({ align });
  };

  const removeFormat = () => {
    editor.richText.removeFormat();
  };

  return (
    <div
      className={cn(
        "bg-background fixed z-9999 flex -translate-x-1/2 transform items-center space-x-2 rounded-lg border p-1 shadow-[0_2px_16px_0_rgba(0,0,0,0.06)]",
        showRichTextToolbar
          ? "flex opacity-100 transition-opacity duration-300"
          : "hidden opacity-0 transition-opacity duration-300",
        className,
      )}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bold */}
      <Tooltip content={t("mindmap.richTextToolbar.bold")} delay={0} side="bottom" className="">
        <Button
          variant="outline"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center px-0 ${formatInfo.bold ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleBold}
        >
          <Bold className="size-5" />
        </Button>
      </Tooltip>

      {/* Italic */}
      <Tooltip content={t("mindmap.richTextToolbar.italic")} delay={0} side="bottom" className="">
        <Button
          variant="outline"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center px-0 ${formatInfo.italic ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleItalic}
        >
          <Italic className="size-5" />
        </Button>
      </Tooltip>

      {/* Underline */}
      <Tooltip content={t("mindmap.richTextToolbar.underline")} delay={0} side="bottom" className="">
        <Button
          variant="outline"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center px-0 ${formatInfo.underline ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleUnderline}
        >
          <Underline className="size-5" />
        </Button>
      </Tooltip>

      {/* Strike */}
      <Tooltip content={t("mindmap.richTextToolbar.strike")} delay={0} side="bottom" className="">
        <Button
          variant="outline"
          className={`flex h-8 w-8 cursor-pointer items-center justify-center px-0 ${formatInfo.strike ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          onClick={toggleStrike}
        >
          <Strikethrough className="size-5" />
        </Button>
      </Tooltip>

      {/* Font Family */}
      <FontFamilyMenu
        open={isFontFamilyOpen}
        disabled={false}
        fontFamilyListOptions={fontFamilyListOptions}
        currentFontFamily={formatInfo.font}
        onFontFamilyChange={changeFontFamily}
        onOpenChange={setIsFontFamilyOpen}
      />

      {/* Font Size */}
      <FontSizeMenu
        open={isFontSizeOpen}
        disabled={false}
        fontSizeListOptions={fontSizeList}
        currentFontSize={formatInfo.size}
        onFontSizeChange={changeFontSize}
        onOpenChange={setIsFontSizeOpen}
      />

      {/* Font Color */}
      <ColorPicker
        tooltipContent={t("mindmap.richTextToolbar.color")}
        IconComponent={CaseUpper}
        open={isTextColorOpen}
        disabled={false}
        currentColor={formatInfo.color}
        onColorChange={changeTextColor}
        onOpenChange={setIsTextColorOpen}
      />

      {/* Background Color */}
      <ColorPicker
        tooltipContent={t("mindmap.richTextToolbar.backgroundColor")}
        IconComponent={Highlighter}
        open={isBackgroundColorOpen}
        disabled={false}
        currentColor={formatInfo.background}
        onColorChange={changeBackgroundColor}
        onOpenChange={setIsBackgroundColorOpen}
      />

      {/* Text Align */}
      <TextAlignMenu
        open={isTextAlignOpen}
        disabled={false}
        textAlignListOptions={alignListOptions}
        currentTextAlign={formatInfo.align}
        onTextAlignChange={changeTextAlign}
        onOpenChange={setIsTextAlignOpen}
      />
      {/* Remove Format */}
      <Tooltip content={t("mindmap.richTextToolbar.removeFormat")} delay={0} side="bottom" className="">
        <Button
          variant="outline"
          className="flex h-8 w-8 cursor-pointer items-center justify-center px-0"
          onClick={removeFormat}
        >
          <Eraser className="size-5" />
        </Button>
      </Tooltip>
    </div>
  );
};
