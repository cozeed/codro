import { useContext, type HTMLProps } from "react";
import { isTauriApp } from "@/lib/navigator";
import { SyncButton } from "@/components/sync-button";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "../components/button";
import { Icons } from "../components/icons";
import TauriAppWindowContext from "../contexts/plugin-window";
import { cn } from "../libs/utils";

export function Windows({ className, ...props }: HTMLProps<HTMLDivElement>) {
  const { isWindowMaximized, minimizeWindow, maximizeWindow, closeWindow } = useContext(TauriAppWindowContext);

  return (
    <div className={cn("h-10", className)} {...props}>
      <SyncButton className="h-10 max-h-10 w-[46px] cursor-pointer rounded-none bg-transparent text-black/90 hover:bg-black/5 active:bg-black/3 dark:text-white dark:hover:bg-white/6 dark:active:bg-white/4" />
      <ThemeToggle className="h-10 max-h-10 w-[46px] cursor-pointer rounded-none bg-transparent text-black/90 hover:bg-black/5 active:bg-black/3 dark:text-gray-300 dark:hover:bg-gray-300/6 dark:active:bg-gray-300/4" />
      {isTauriApp() ? (
        <>
          <Button
            onClick={minimizeWindow}
            className="h-10 max-h-10 w-[46px] cursor-default rounded-none bg-transparent text-black/90 hover:bg-black/5 active:bg-black/3 dark:text-white dark:hover:bg-white/6 dark:active:bg-white/4"
          >
            <Icons.minimizeWin />
          </Button>
          <Button
            onClick={maximizeWindow}
            className={cn(
              "max-h-10 w-[46px] cursor-default rounded-none bg-transparent",
              "text-black/90 hover:bg-black/5 active:bg-black/3 dark:text-white dark:hover:bg-white/6 dark:active:bg-white/4",
              // !isMaximizable && "text-white/[.36]",
            )}
          >
            {!isWindowMaximized ? <Icons.maximizeWin /> : <Icons.maximizeRestoreWin />}
          </Button>
          <Button
            onClick={closeWindow}
            className="max-h-10 w-[46px] cursor-default rounded-none bg-transparent text-black/90 hover:bg-[#c42b1c] hover:text-white active:bg-[#c42b1c]/90 dark:text-white"
          >
            <Icons.closeWin />
          </Button>
        </>
      ) : null}
    </div>
  );
}
