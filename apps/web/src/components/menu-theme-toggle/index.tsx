import { Laptop, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@workspace/ui/components/menubar";
import { cn } from "@/lib/utils";

export const MenuThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <MenubarSub>
      <MenubarSubTrigger>{t("settings.theme")}</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem
          onClick={() => setTheme("light")}
          className={cn(theme === "light" ? "font-bold" : "text-muted-foreground")}
        >
          <SunMedium className="mr-2 size-4" />
          <span>Light</span>
        </MenubarItem>
        <MenubarItem
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" ? "font-bold" : "text-muted-foreground")}
        >
          <Moon className="mr-2 size-4" />
          <span>Dark</span>
        </MenubarItem>
        <MenubarItem
          onClick={() => setTheme("system")}
          className={cn(theme === "system" ? "font-bold" : "text-muted-foreground")}
        >
          <Laptop className="mr-2 size-4" />
          <span>System</span>
        </MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  );
};
