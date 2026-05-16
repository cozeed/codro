import { forwardRef } from "react";
import { Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tooltip } from "@/components/tooltip";

interface Props {
  open: boolean;
  disabled: boolean;
  fontFamilyListOptions: { value: string; name: string }[];
  currentFontFamily: string;
  onFontFamilyChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

export const FontFamilyMenu = forwardRef<HTMLDivElement, Props>(
  ({ open, disabled, fontFamilyListOptions, currentFontFamily, onFontFamilyChange, onOpenChange }, ref) => {
    const { t } = useTranslation();
    return (
      <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <span>
            <Tooltip content={t("mindmap.richTextToolbar.fontFamily")} delay={0} side="bottom" className="">
              <Button
                variant="outline"
                disabled={disabled}
                className="flex h-8 w-8 cursor-pointer items-center justify-center px-0"
              >
                <Type className="size-5" />
              </Button>
            </Tooltip>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={ref}
          side="top"
          sideOffset={8}
          hideWhenDetached={true}
          className="bg-popover z-9999 max-h-[calc(1.25rem*10+0.25rem*2)] overflow-y-auto rounded border-0 p-1 shadow-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
          }}
        >
          {fontFamilyListOptions.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className={`hover:bg-accent hover:text-accent-foreground flex h-5 w-full cursor-pointer items-center ${currentFontFamily === item.value ? "text-green-500" : ""}`}
              style={{ fontFamily: item.value }}
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFontFamilyChange(item.value);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onOpenChange(false);
                }
              }}
            >
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

FontFamilyMenu.displayName = "FontFamilyMenu";
