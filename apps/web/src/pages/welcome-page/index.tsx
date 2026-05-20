import { ArrowUpRightFromCircle, File, Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CoFileTree } from "@/types/file";
import { Card, CardContent } from "@workspace/ui/components/card";
import { isTauriApp } from "@/lib/navigator";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { coFileRegistry } from "@/plugins/registry";
import { AttentionAnimation } from "@/components/attention-animation";
import { DownloadApp } from "@/components/download-app";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Spinner } from "@/components/spinner";
import { StatsCard } from "@/components/stats-card";

function calculateStats(tree: CoFileTree) {
  const typeCounts: Record<string, number> = {};
  let totalFolders = 0;
  let totalFiles = 0;

  if (!tree) return { totalFolders, totalFiles, typeCounts };

  for (const node of Object.values(tree)) {
    const data = node?.data;
    if (!data) continue;

    if (data.type === "folder") {
      if (data.id !== "root") totalFolders++;
      continue;
    }

    totalFiles++;
    typeCounts[data.type] = (typeCounts[data.type] || 0) + 1;
  }

  return { totalFolders, totalFiles, typeCounts };
}

const WelcomeContent = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="text-sm text-slate-400">
        <Logo className="mb-4" size="small" url="https://cozeed.com" />
        <p className="mb-4">{t("welcome.productDesc")}</p>

        {!isTauriApp() && (
          <p className="mb-4 flex cursor-pointer items-center hover:text-sky-500">
            <DownloadApp className="mr-2" />
            {t("welcome.downloadApp")}
          </p>
        )}

        <p className="mb-4">
          <a
            href="https://github.com/cozeed/codro"
            target="_blank"
            rel="noreferrer"
            className="relative flex cursor-pointer items-center hover:text-sky-500"
          >
            <AttentionAnimation />
            <Icons.github className="mr-2 h-4 w-4" /> {t("welcome.github")}
          </a>
        </p>

        <p className="mb-4">
          <a
            href="https://github.com/cozeed/codro"
            target="_blank"
            rel="noreferrer"
            className="relative flex cursor-pointer items-center hover:text-sky-500"
          >
            <AttentionAnimation />
            <ArrowUpRightFromCircle className="mr-2 h-4 w-4" /> {t("welcome.issue")}
          </a>
        </p>

        <p className="mb-4">
          <a
            href="https://www.reddit.com/r/cozeedapp"
            target="_blank"
            rel="noreferrer"
            className="relative flex cursor-pointer items-center hover:text-sky-500"
          >
            <AttentionAnimation />
            <Icons.reddit className="mr-2 h-4 w-4" /> {t("welcome.reddit")}
          </a>
        </p>

        <p className="mb-4">
          <a
            href="https://x.com/cozeed_app"
            target="_blank"
            rel="noreferrer"
            className="relative flex cursor-pointer items-center hover:text-sky-500"
          >
            <AttentionAnimation />
            <Icons.x className="mr-2 h-4 w-4" /> {t("welcome.x")}
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export const WelcomePage = () => {
  const { fileTreeData, isReading } = useFileTreeQuery();

  const stats = fileTreeData ? calculateStats(fileTreeData) : null;
  const plugins = coFileRegistry.list();

  if (isReading) return <Spinner withText />;

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 pt-6">
      <div className="space-y-6">
        {/* Row 1 */}
        <div className="*:data-[slot=card]:bg-muted/40 dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2">
          <StatsCard title="Total Folders" value={stats?.totalFolders ?? 0} icon={<Folder className="size-4" />} color="text-muted-foreground" />

          <StatsCard title="Total Files" value={stats?.totalFiles ?? 0} icon={<File className="size-4" />} color="text-muted-foreground" />
        </div>

        {/* Row 2 */}
        <div className="*:data-[slot=card]:bg-muted/40 dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-3 xl:grid-cols-5">
          {plugins.map((plugin) => (
          <StatsCard
            key={plugin.id}
            title={`${plugin.meta.displayName} Files`}
            value={stats?.typeCounts[plugin.id] ?? 0}
            icon={<plugin.meta.icon className="size-4" />}
          />
        ))}
        </div>

        {/* Row 3 */}
        <WelcomeContent />
      </div>

      <div className="mt-auto pb-6 text-center text-sm text-slate-500">
        Copyright © 2026{" "}
        <a href="https://cozeed.com" target="_blank" rel="noreferrer">
          Codro by Cozeed
        </a>
        . All rights reserved.
      </div>
    </div>
  );
};
