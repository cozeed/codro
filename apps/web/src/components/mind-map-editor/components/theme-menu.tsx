import { forwardRef, useMemo, useState } from "react";
import { Shirt } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import type MindMap from "simple-mind-map";
import themeImgMap from "simple-mind-map-plugin-themes/themeImgMap";
import themeList from "simple-mind-map-plugin-themes/themeList";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tooltip } from "@/components/tooltip";

interface ThemeProps {
  name: string;
  value: string;
  theme: Record<string, unknown>;
  dark: boolean;
}

interface Props {
  editor: MindMap;
}

export const ThemeMenu = forwardRef<HTMLDivElement, Props>(({ editor }, ref) => {
  const isDark = useTheme().theme === "dark";
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // 1️⃣ stable theme list
  const themeListAll = useMemo(
    () => [
      {
        name: "Default theme",
        value: "default",
        dark: false,
      },
      ...themeList,
    ],
    [],
  );

  // 2️⃣ derived theme options (no state, no effect)
  const themeListOptions = useMemo<ThemeProps[]>(() => {
    return themeListAll.filter((item) => (isDark ? item.dark : !item.dark));
  }, [isDark, themeListAll]);

  // 3️⃣ current theme (sync from editor only when render)
  const currentTheme = editor.getTheme();

  const onThemeChange = (value: string) => {
    editor.setThemeConfig({}, true);
    editor.setTheme(value);
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip content={t("mindmap.theme.title")} delay={0} side="bottom">
            <Button variant="outline" className="flex h-8 w-8 cursor-pointer items-center justify-center px-0">
              <Shirt className="size-5" />
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
        className="bg-popover z-9999 max-h-[calc(8rem*4+0.25rem*(4-1)+0.25rem*2)] min-w-48 space-y-1 overflow-y-auto rounded border-0 p-1 shadow-md"
      >
        {themeListOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={`hover:bg-accent hover:text-accent-foreground flex h-32 w-full cursor-pointer border p-1 ${
              currentTheme === item.value ? "border-green-500 text-green-500" : "border-transparent"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onThemeChange(item.value);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-between">
              <img src={themeImgMap[item.value]} alt="" className="h-24 w-full object-contain" />
              <span className="mt-0.5 text-xs">{item.value}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ThemeMenu.displayName = "ThemeMenu";
