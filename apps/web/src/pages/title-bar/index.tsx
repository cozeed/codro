"use client";

import { useCallback, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { Dialog } from "@workspace/ui/components/dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@workspace/ui/components/menubar";
import { isTauriApp } from "@/lib/navigator";
import { Icons } from "@/components/icons";
import { MenuThemeToggle } from "@/components/menu-theme-toggle";
import { WindowTitlebar } from "@/components/tauri-controls";

import { AboutDialog } from "../about-dialog";

export const TitleBar = () => {
  const { t } = useTranslation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeWindow = useCallback(async () => {
    const appWindow = getCurrentWindow();

    await appWindow.close();
  }, []);

  return (
    <WindowTitlebar className="dark:bg-background flex h-10 items-center bg-gray-50">
      {/* <WindowTitlebar
      controlsOrder="platform"
      windowControlsProps={{ platform: "macos", className: "" }}
      > */}
      <Menubar className="border-none bg-transparent pl-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="font-bold text-[#d76b24] focus:text-[#d76b24] data-[state=open]:text-[#d76b24]">
            <div className="inline-flex h-fit w-fit items-center pr-2">
              <Icons.logo className="size-5" />
            </div>
            Codro
          </MenubarTrigger>

          <MenubarContent>
            <MenuThemeToggle />
            <MenubarSeparator />
            <MenubarItem
              onSelect={() => {
                setAboutOpen(true);
              }}
            >
              {t("settings.about")} ...
            </MenubarItem>
            {isTauriApp() && (
              <MenubarItem onClick={closeWindow}>
                {t("settings.quit")} <MenubarShortcut>⌘Q</MenubarShortcut>
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen} modal={false}>
        <AboutDialog />
      </Dialog>
    </WindowTitlebar>
  );
};
