import { Suspense } from "react";
import { Settings, Waves } from "lucide-react";
import type { CoFile } from "@/types/file";
import { coFileRegistry } from "@/plugins/registry";

import { SettingsPage } from "../settings";
import { WelcomePage } from "../welcome-page";

// Get icon for file type
export const getFileTypeIcon = (fileType: string) => {
  if (fileType === "welcome") return <Waves className="size-4 text-sky-600 dark:text-sky-400" />;
  if (fileType === "setting") return <Settings className="size-4" />;

  const Icon = coFileRegistry.get(fileType)?.meta.icon;
  return Icon ? <Icon /> : null;
};

// Get editor component for file type
export const getFileTypeEditor = (file: CoFile) => {
  const fileType = file?.type || "welcome";

  if (fileType === "welcome") return <WelcomePage />;
  if (fileType === "setting") return <SettingsPage />;

  const plugin = coFileRegistry.get(fileType);
  if (!plugin) return null;

  const Editor = plugin.components.editor;
  return (
    <Suspense fallback={null}>
      <Editor file={file} />
    </Suspense>
  );
};
