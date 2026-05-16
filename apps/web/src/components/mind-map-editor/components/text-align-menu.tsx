import { forwardRef } from "react";
import { AlignStartVertical } from "lucide-react";
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
  textAlignListOptions: { value: string; name: string }[];
  currentTextAlign: string;
  onTextAlignChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

export const TextAlignMenu = forwardRef<HTMLDivElement, Props>(
  ({ open, disabled, textAlignListOptions, currentTextAlign, onTextAlignChange, onOpenChange }, ref) => {
    const { t } = useTranslation();
    return (
      <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <span>
            <Tooltip content={t("mindmap.richTextToolbar.textAlign")} delay={0} side="bottom" className="">
              <Button
                variant="outline"
                disabled={disabled}
                className="flex h-8 w-8 cursor-pointer items-center justify-center px-0"
              >
                <AlignStartVertical className="size-5" />
              </Button>
            </Tooltip>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          ref={ref}
          side="top"
          sideOffset={8}
          hideWhenDetached={true}
          className="bg-popover z-9999 max-h-[calc(1.5rem*4+0.25rem*(4-1)+0.25rem*2))] space-y-1 overflow-y-auto rounded border-0 p-1 shadow-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
          }}
        >
          {textAlignListOptions.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className={`hover:bg-accent hover:text-accent-foreground flex h-6 w-full cursor-pointer items-center border p-1 ${currentTextAlign === item.value ? "border-green-500 text-green-500" : "border-transparent"}`}
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTextAlignChange(item.value);
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

TextAlignMenu.displayName = "TextAlignMenu";
