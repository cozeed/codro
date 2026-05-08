import { useContext, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { Loader, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DBContext, DBStatus } from "@workspace/pglite/provider";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";
import { isSavingAtom } from "@/store/jotai";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip } from "@/components/tooltip";

interface Props {
  className?: string;
}

export const SyncButton = ({ className }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { client, status, setStatus } = useContext(DBContext);
  const syncing = status === DBStatus.Syncing;
  const [isSaving] = useAtom(isSavingAtom);
  const manualSyncRef = useRef(false);

  useEffect(() => {
    if (manualSyncRef.current && user?.id && status === DBStatus.Ready) {
      manualSyncRef.current = false;
      toast.success(t("operation.syncSuccess"));
    }
  }, [user?.id, status, t]);
  const handleSyncClick = () => {
    // set sync status to PendingSync
    manualSyncRef.current = true;
    setStatus(DBStatus.PendingSync);
  };

  return (
    <Tooltip content={t("operation.sync")} delay={0} side="bottom" sideOffset={-4} className="">
      <Button
        onClick={handleSyncClick}
        disabled={syncing || isSaving || !client || !user?.id}
        className={cn(
          "h-10 max-h-10 w-18 rounded-none bg-transparent",
          "text-black/90 hover:bg-black/5 active:bg-black/3",
          "dark:text-white dark:hover:bg-white/6 dark:active:bg-white/4",
          className,
        )}
      >
        {syncing ? <Loader className="animate-spin" /> : <RefreshCcw />}
      </Button>
    </Tooltip>
  );
};
