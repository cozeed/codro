import React, { forwardRef } from "react";
import { Sketch } from "@uiw/react-color";
import { useTheme } from "next-themes";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Tooltip } from "@/components/tooltip";

import "../index.css";

interface Props {
  tooltipContent: string;
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  open: boolean;
  disabled: boolean;
  currentColor: string;
  onColorChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

export const ColorPicker = forwardRef<HTMLDivElement, Props>(
  ({ tooltipContent, IconComponent, open, disabled, currentColor, onColorChange, onOpenChange }, ref) => {
    const { theme } = useTheme();

    const handlePointerDownEvent = (e: any) => {
      if (e.target.className == "" && e.target.offsetParent.className != "w-color-interactive") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
    };

    return (
      <Popover modal={false} open={open && !disabled} onOpenChange={(open) => !disabled && onOpenChange(open)}>
        <PopoverTrigger asChild>
          <span>
            <Tooltip content={tooltipContent} delay={0} side="bottom" className="">
              <Button
                variant="outline"
                disabled={disabled}
                className="flex h-8 w-8 cursor-pointer items-center justify-center px-0"
              >
                <span className="flex flex-col items-center justify-center leading-none">
                  <IconComponent className="size-5" />
                  <span className="-mt-[1px] block h-[3px] w-5 rounded" style={{ backgroundColor: currentColor }} />
                </span>
              </Button>
            </Tooltip>
          </span>
        </PopoverTrigger>
        <PopoverContent
          ref={ref}
          side="top"
          sideOffset={8}
          hideWhenDetached={true}
          className="bg-popover z-9999 w-auto rounded p-0 shadow-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div data-color-mode={theme === "dark" ? "dark" : "light"}>
            <Sketch
              color={currentColor}
              presetColors={false}
              editableDisable={false}
              onChange={(color) => {
                onColorChange(color.hex);
              }}
              onPointerDownCapture={(e) => handlePointerDownEvent(e)}
              onClickCapture={(e) => handlePointerDownEvent(e)}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
