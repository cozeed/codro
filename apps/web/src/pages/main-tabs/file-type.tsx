import type { JSX } from "react";
import { FileType, Palette, Settings, Waves } from "lucide-react";
import type { CoFile, CoFileType } from "@/types/file";
import { DrawioEditor } from "@/components/drawio-editor";
import { ExcalidrawEditor } from "@/components/excalidraw-editor";
import { Icons } from "@/components/icons";
import { MindMapEditor } from "@/components/mind-map-editor";
import { NoteEditor } from "@/components/note-editor";
import { TldrawEditor } from "@/components/tldraw-editor";

import { SettingsPage } from "../settings";
import { WelcomePage } from "../welcome-page";

// Get icon for file type
export const getFileTypeIcon = (fileType: CoFileType) => {
  const icons: Record<CoFileType, JSX.Element> = {
    note: <FileType className="size-4 text-blue-600 dark:text-blue-400" />,
    board: <Palette className="size-4 text-orange-700 dark:text-orange-600" />,
    tldraw: <Icons.tldraw className="size-4 text-yellow-800 dark:text-yellow-500" />,
    mindmap: <Icons.mindmap className="size-4 text-purple-700 dark:text-purple-400" />,
    drawio: <Icons.drawio className="size-4 text-amber-600 dark:text-amber-500" />,
    welcome: <Waves className="size-4 text-sky-600 dark:text-sky-400" />,
    setting: <Settings className="size-4" />,
  };

  return icons[fileType] || null;
};
// Get editor component for file type
export const getFileTypeEditor = (file: CoFile) => {
  const fileType = file?.type || "welcome";
  const editors: Record<CoFileType, JSX.Element> = {
    note: <NoteEditor file={file} />,
    board: <ExcalidrawEditor file={file} />,
    tldraw: <TldrawEditor file={file} />,
    mindmap: <MindMapEditor file={file} />,
    drawio: <DrawioEditor file={file} />,
    setting: <SettingsPage />,
    welcome: <WelcomePage />,
  };
  return editors[fileType] || null;
};
