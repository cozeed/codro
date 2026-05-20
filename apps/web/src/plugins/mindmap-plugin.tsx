import React from "react";
import i18n from "i18next";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { definePlugin } from "./types";

const MindMapEditor = React.lazy(() =>
  import("@/components/mind-map-editor").then((m) => ({ default: m.MindMapEditor })),
);
const MindMapDiagram = React.lazy(() =>
  import("@/components/assistant-ui/mind-map-diagram").then((m) => ({ default: m.MindMapDiagram })),
);

export const mindmapPlugin = definePlugin({
  id: "mindmap",
  meta: {
    displayName: "Mindmap",
    defaultFileName: "New Mindmap",
    suffix: ".mindmap",
    tooltip: "operation.addMindmap",
    icon: ({ className }) => <Icons.mindmap className={cn("size-4 text-purple-700 dark:text-purple-400", className)} />,
  },
  components: {
    editor: MindMapEditor,
    diagram: MindMapDiagram,
  },
  data: {
    getInitialData: () => ({
      root: {
        data: { text: i18n.t("operation.mindCentralTopic") },
        children: [],
      },
      view: null,
    }),
  },
});
