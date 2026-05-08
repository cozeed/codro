import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { currentSidebarAtom } from "@/store/jotai";
import { Icons } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";

import { ExportFiles } from "../export-files";
import { ImportFiles } from "../import-files";

export const MainHeader = () => {
  const { t } = useTranslation();
  const [, setCurrentSidebar] = useAtom(currentSidebarAtom);
  return (
    <div className="flex h-10 w-full items-center justify-between p-1">
      {/* left */}
      <div />

      {/* right */}
      <div className="flex items-center gap-1">
        {/* file buttons */}
        <ImportFiles />
        <ExportFiles />
        {/* switch AI button */}
        <Tooltip content={t("operation.aiCreate")} delay={0} side="bottom" sideOffset={-4} className="">
          <Button variant="ghost" className="size-7 text-sm" onClick={() => setCurrentSidebar("chat")}>
            <Icons.chat className="size-5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
