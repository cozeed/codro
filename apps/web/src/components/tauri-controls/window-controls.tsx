import { useEffect, useState } from "react";

import { TauriAppWindowProvider } from "./contexts/plugin-window";
import { Gnome, MacOS, Windows } from "./controls";
import { getOsType } from "./libs/plugin-os";
import { cn } from "./libs/utils";
import type { WindowControlsProps } from "./types";

export const WindowControls = ({
  platform,
  justify = false,
  hide = false,
  hideMethod = "display",
  className,
  ...props
}: WindowControlsProps) => {
  const [osType, setOsType] = useState<string | undefined>(undefined);

  useEffect(() => {
    getOsType().then((type) => {
      setOsType(type);
    });
  }, []);

  const customClass = cn("flex", className, hide && (hideMethod === "display" ? "hidden" : "invisible"));

  // fallback platform
  let resolvedPlatform = platform;

  if (!resolvedPlatform) {
    switch (osType) {
      case "macos":
        resolvedPlatform = "macos";
        break;
      case "linux":
        resolvedPlatform = "gnome";
        break;
      default:
        resolvedPlatform = "windows";
    }
  }

  return (
    <TauriAppWindowProvider>
      {resolvedPlatform === "windows" && <Windows className={cn(customClass, justify && "ml-auto")} {...props} />}

      {resolvedPlatform === "macos" && <MacOS className={cn(customClass, justify && "ml-0")} {...props} />}

      {resolvedPlatform === "gnome" && <Gnome className={cn(customClass, justify && "ml-auto")} {...props} />}
    </TauriAppWindowProvider>
  );
};
