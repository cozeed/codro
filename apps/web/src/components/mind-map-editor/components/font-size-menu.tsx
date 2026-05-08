import { forwardRef } from "react";
import { LetterText } from "lucide-react";
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
  fontSizeListOptions: number[];
  currentFontSize: string;
  onFontSizeChange: (value: number) => void;
  onOpenChange: (open: boolean) => void;
}

export const FontSizeMenu = forwardRef<HTMLDivElement, Props>(
  ({ open, disabled, fontSizeListOptions, currentFontSize, onFontSizeChange, onOpenChange }, ref) => {
    const { t } = useTranslation();
    return (
      <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <span>
            <Tooltip content={t("mindmap.richTextToolbar.fontSize")} delay={0} side="bottom" className="">
              <Button
                variant="outline"
                disabled={disabled}
                className="flex h-8 w-8 cursor-pointer items-center justify-center px-0"
              >
                <LetterText className="size-5" />
              </Button>
            </Tooltip>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={ref}
          side="top"
          sideOffset={8}
          hideWhenDetached={true}
          className="bg-popover z-[9999] max-h-[calc(1.25rem*8+0.25rem*2)] overflow-y-auto rounded border-0 p-1 shadow-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
          }}
        >
          {fontSizeListOptions.map((size) => (
            <DropdownMenuItem
              key={size}
              className={`formatInfo.size === item + 'px' ? 'active' : '' hover:bg-accent hover:text-accent-foreground flex h-5 w-full cursor-pointer items-center p-1 ${currentFontSize === `${size}px` ? "text-green-500" : ""}`}
              style={{ fontSize: `${size}px`, height: `${size < 30 ? 30 : size + 10}px` }}
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFontSizeChange(size);
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
              {size}px
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

FontSizeMenu.displayName = "FontSizeMenu";
