import React from "react";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { definePlugin } from "./types";

const ExcalidrawEditor = React.lazy(() =>
  import("@/components/excalidraw-editor").then((m) => ({ default: m.ExcalidrawEditor })),
);
const ExcalidrawDiagram = React.lazy(() =>
  import("@/components/assistant-ui/excalidraw-diagram").then((m) => ({ default: m.ExcalidrawDiagram })),
);

export const boardPlugin = definePlugin({
  id: "board",
  meta: {
    displayName: "Excalidraw",
    defaultFileName: "New Excalidraw",
    suffix: ".excalidraw",
    tooltip: "operation.addBoard",
    icon: ({ className }) => <Palette className={cn("size-4 text-orange-700 dark:text-orange-600", className)} />,
  },
  components: {
    editor: ExcalidrawEditor,
    diagram: ExcalidrawDiagram,
  },
  data: {
    getInitialData: () => ({}),
  },
});
