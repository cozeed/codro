import type { FC, ReactNode } from "react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

interface Props {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  delay?: number;
  className?: string;
}

export const Tooltip: FC<Props> = ({
  content,
  children,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  delay = 500,
  className,
}) => (
  <TooltipProvider>
    <ShadcnTooltip delayDuration={delay}>
      <TooltipTrigger asChild>
        <span>{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={`z-9999 ${className}`}
      >
        <p>{content}</p>
      </TooltipContent>
    </ShadcnTooltip>
  </TooltipProvider>
);

Tooltip.displayName = "Tooltip";
