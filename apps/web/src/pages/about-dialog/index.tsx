import { useEffect, useState } from "react";
import { getName, getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch } from "@tauri-apps/plugin-os";
import { HomeIcon } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { isTauriApp, openLink } from "@/lib/navigator";
import { Icons } from "@/components/icons";

export const AboutDialog = () => {
  const isTauri = isTauriApp();
  const [version, setVersion] = useState("");
  const [name, setName] = useState("");
  const [tauriVersion, setTauriVersion] = useState("");
  const arc = isTauri ? arch() : "";

  useEffect(() => {
    const initData = async () => {
      const versionData = isTauri ? await getVersion() : "";
      setVersion(versionData);

      const nameData = isTauri ? await getName() : "Codro";
      setName(nameData);

      const tauriVersionData = isTauri ? await getTauriVersion() : "";
      setTauriVersion(tauriVersionData);
    };

    initData();
  }, [isTauri]);

  return (
    <DialogContent className="overflow-clip pb-2">
      <DialogHeader className="flex items-center text-center">
        <div className="bg-background rounded-full p-1.5 text-slate-600 drop-shadow-none transition duration-1000 hover:text-slate-800 hover:drop-shadow-[0_0px_10px_rgba(0,10,50,0.50)] dark:hover:text-slate-400">
          <Icons.logo className="size-12" />
        </div>

        <DialogTitle className="flex flex-col items-center gap-2 pt-2">
          {name}
          {isTauri && (
            <span className="flex gap-1 font-mono text-xs font-medium">
              Version {version} ({arc})
              <span className="font-sans font-medium text-gray-400">
                (
                <span
                  className="cursor-pointer text-blue-500"
                  onClick={() => openLink("https://github.com/cozeed/codro/releases/latest")}
                >
                  release notes
                </span>
                )
              </span>
            </span>
          )}
        </DialogTitle>

        <DialogDescription className="text-foreground">Codro – Think & Draw Workspace</DialogDescription>

        <DialogDescription className="flex flex-row"></DialogDescription>
      </DialogHeader>

      {isTauri && <span className="font-mono text-xs font-medium text-gray-400">Tauri version: {tauriVersion}</span>}
      <DialogFooter className="flex flex-row items-center border-t pt-2 pb-1 text-slate-400">
        <div className="mr-auto flex flex-row gap-2">
          <HomeIcon
            className="h-5 w-5 cursor-pointer transition hover:text-slate-300"
            onClick={() => openLink("https://cozeed.com")}
          />
          <Icons.github
            className="h-5 w-5 cursor-pointer transition hover:text-slate-300"
            onClick={() => openLink("https://github.com/cozeed/codro")}
          />
        </div>
      </DialogFooter>
    </DialogContent>
  );
};
