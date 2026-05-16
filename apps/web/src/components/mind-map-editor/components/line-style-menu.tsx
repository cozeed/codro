import { forwardRef, useState } from "react";
import i18n from "i18next";
import { Shuffle } from "lucide-react";
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

import { lineStyleList } from "../config";
import { lineStyleMap } from "../config/constant";

interface Props {
  editor: MindMap;
}

export const LineStyleMenu = forwardRef<HTMLDivElement, Props>(({ editor }, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [currentLineStyle, setCurrentLineStyle] = useState<string>(editor.getThemeConfig("lineStyle"));
  const lineStyleListOptions = lineStyleList[i18n.language as keyof typeof lineStyleList];
  const lineStyleMapOptions = lineStyleMap;

  const onLineStyleChange = (value: string) => {
    setCurrentLineStyle(value);
    editor.setThemeConfig({ ...editor.themeConfig, lineStyle: value });
    editor.view.fit(() => {}, false, undefined); // Need fit to save directly
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip content={t("mindmap.baseStyle.style")} delay={0} side="bottom" className="">
            <Button variant="outline" className="flex h-8 w-8 cursor-pointer items-center justify-center px-0">
              <Shuffle className="size-5" />
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
        className="bg-popover z-9999 max-h-[calc(4rem*4+0.25rem*(4-1)+0.25rem*2)] w-20 space-y-1 overflow-y-auto rounded border-0 p-1 shadow-md"
      >
        {lineStyleListOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={`hover:bg-accent hover:text-accent-foreground flex h-16 w-full cursor-pointer border p-1 ${currentLineStyle === item.value ? "border-green-500 text-green-500" : "border-transparent"}`}
            onClick={(e) => {
              e.preventDefault();
              onLineStyleChange(item.value);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-between">
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(lineStyleMapOptions[item.value as keyof typeof lineStyleMapOptions])}`}
                alt=""
                className="h-10 w-full object-contain dark:bg-gray-300"
              />
              <span className="mt-0.5 text-xs">{item.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

LineStyleMenu.displayName = "LineStyleMenu";
