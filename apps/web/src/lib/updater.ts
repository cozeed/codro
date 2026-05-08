import type { Update } from "@tauri-apps/plugin-updater";
import { toast } from "sonner";
import i18n from "@/i18n/config";

export type UpdateStatus = { status: "upToDate" } | { status: "available"; update: Update };

export async function checkForUpdate(): Promise<UpdateStatus> {
  const { check } = await import("@tauri-apps/plugin-updater");
  const update = await check();
  if (!update) return { status: "upToDate" };
  return { status: "available", update };
}

export async function installUpdate(
  update: Update,
  onProgress?: (downloaded: number, total: number) => void,
): Promise<void> {
  let downloaded = 0;
  let contentLength = 0;

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        contentLength = event.data.contentLength ?? 0;
        onProgress?.(0, contentLength);
        break;
      case "Progress":
        downloaded += event.data.chunkLength;
        onProgress?.(downloaded, contentLength);
        break;
      case "Finished":
        break;
    }
  });
}

export async function relaunchApp(): Promise<void> {
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}

export async function autoUpdate(): Promise<void> {
  try {
    const result = await checkForUpdate();
    if (result.status !== "available") return;

    const { update } = result;

    toast.info(i18n.t("updater.newVersionAvailable", { version: update.version }), {
      action: {
        label: i18n.t("updater.update"),
        onClick: async () => {
          const id = toast.loading(i18n.t("updater.downloading", { pct: 0 }));
          try {
            await installUpdate(update, (downloaded, total) => {
              const pct = total ? Math.round((downloaded / total) * 100) : 0;
              toast.loading(i18n.t("updater.downloading", { pct }), { id });
            });
            toast.dismiss(id);
            toast.success(i18n.t("updater.installed"), {
              action: { label: i18n.t("updater.restart"), onClick: () => relaunchApp() },
            });
          } catch {
            toast.dismiss(id);
            toast.error(i18n.t("updater.failed"));
          }
        },
      },
      duration: Infinity,
    });
  } catch {
    // silent fail
  }
}
