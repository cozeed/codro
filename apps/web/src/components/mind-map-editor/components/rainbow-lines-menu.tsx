import { forwardRef, useEffect, useState } from "react";
import { isEqual } from "es-toolkit";
import { Rainbow } from "lucide-react";
import { useTranslation } from "react-i18next";
import type MindMap from "simple-mind-map";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tooltip } from "@/components/tooltip";

import { rainbowLinesOptions } from "../config/constant";

interface Props {
  editor: MindMap;
}

export const RainbowLinesMenu = forwardRef<HTMLDivElement, Props>(({ editor }, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [, setCurRainbowLines] = useState<any>({});
  const [curColorList, setCurColorList] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    const config = editor.getConfig("rainbowLinesConfig") || {};
    // config->colorList
    setCurColorList(config.open ? (editor.rainbowLines ? editor.rainbowLines.getColorsList() : undefined) : undefined);
  }, [editor]);

  const onRainbowLinesChange = (item: any) => {
    setCurRainbowLines(item);
    setCurColorList(item.list);
    // colorList->config
    const newConfig = item.list ? { open: true, colorsList: item.list } : { open: false };
    // Update config
    editor.config = editor.config || {};
    editor.config.rainbowLinesConfig = newConfig;
    // Update config
    editor.updateConfig({ rainbowLinesConfig: newConfig });
    // Update rainbow lines config
    editor.rainbowLines.updateRainLinesConfig(newConfig);
    //
    editor.view.fit(() => {}, false, undefined); // Need fit to save directly
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip content={t("mindmap.baseStyle.rainbowLines")} delay={0} side="bottom" className="">
            <Button variant="outline" className="flex h-8 w-8 cursor-pointer items-center justify-center px-0">
              <Rainbow className="size-5" />
            </Button>
          </Tooltip>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={ref}
        side="top"
        sideOffset={8}
        hideWhenDetached={true}
        onEscapeKeyDown={() => setOpen(false)}
        className="bg-popover z-9999 max-h-[calc(2rem*8+0.25rem*(8-1)+0.25rem*2)] w-56 space-y-1 overflow-y-auto rounded border-0 p-1 shadow-md"
      >
        {rainbowLinesOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={`hover:bg-accent hover:text-accent-foreground flex h-8 w-full cursor-pointer border p-1 ${isEqual(curColorList, item.list) ? "border-green-500 text-green-500" : "border-transparent"}`}
            onClick={(e) => {
              e.preventDefault();
              onRainbowLinesChange(item);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center">
              {item.list ? (
                <div className="flex items-center justify-center">
                  {item.list.map((colorItem, index) => {
                    return <span key={index} className="h-3 w-7" style={{ backgroundColor: colorItem }}></span>;
                  })}
                </div>
              ) : (
                <div>{t("mindmap.baseStyle.notUseRainbowLines")}</div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

RainbowLinesMenu.displayName = "RainbowLinesMenu";
