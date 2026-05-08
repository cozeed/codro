import * as React from "react";
import { Laptop, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/tooltip";

export const ThemeToggle = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip content={t("settings.theme")} delay={0} side="bottom" sideOffset={4} className="">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                className,
              )}
            >
              <SunMedium className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </Tooltip>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-9999">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(theme === "light" ? "font-bold" : "text-muted-foreground")}
        >
          <SunMedium className="mr-2 size-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" ? "font-bold" : "text-muted-foreground")}
        >
          <Moon className="mr-2 size-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(theme === "system" ? "font-bold" : "text-muted-foreground")}
        >
          <Laptop className="mr-2 size-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
