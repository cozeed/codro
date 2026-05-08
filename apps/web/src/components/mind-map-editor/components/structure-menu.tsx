import { forwardRef, useState } from "react";
import i18n from "i18next";
import { Network } from "lucide-react";
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

import { layoutList } from "../config";
import { layoutImgMap } from "../config/constant.js";

interface Props {
  editor: MindMap;
}

export const StructureMenu = forwardRef<HTMLDivElement, Props>(({ editor }, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [currentStructure, setCurrentStructure] = useState<string>(editor.getLayout());
  const structureListOptions: { value: string; name: string }[] = layoutList[i18n.language as keyof typeof layoutList];

  const onStructureChange = (value: string) => {
    setCurrentStructure(value);
    editor.setLayout(value);
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip content={t("mindmap.strusture.title")} delay={0} side="bottom" className="">
            <Button variant="outline" className="flex h-8 w-8 cursor-pointer items-center justify-center px-0">
              <Network className="size-5" />
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
        className="bg-popover z-[9999] max-h-[calc(5rem*4+0.25rem*(4-1)+0.25rem*2)] w-40 space-y-1 overflow-y-auto rounded border-0 p-1 shadow-md"
      >
        {structureListOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={`hover:bg-accent hover:text-accent-foreground flex h-20 w-full cursor-pointer border p-1 ${currentStructure === item.value ? "border-green-500 text-green-500" : "border-transparent"}`}
            onClick={(e) => {
              e.preventDefault();
              onStructureChange(item.value);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-between">
              <img
                src={layoutImgMap[item.value as keyof typeof layoutImgMap]}
                alt=""
                className="h-14 w-full object-contain"
              />
              <span className="mt-0.5 text-xs">{item.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

StructureMenu.displayName = "StructureMenu";
