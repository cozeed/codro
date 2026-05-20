import React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { definePlugin } from "./types";

const TldrawEditor = React.lazy(() =>
  import("@/components/tldraw-editor").then((m) => ({ default: m.TldrawEditor })),
);

export const tldrawPlugin = definePlugin({
  id: "tldraw",
  meta: {
    displayName: "Tldraw",
    defaultFileName: "New Tldraw",
    suffix: ".tldr",
    tooltip: "operation.addTldraw",
    icon: ({ className }) => <Icons.tldraw className={cn("size-4 text-yellow-800 dark:text-yellow-500", className)} />,
  },
  components: {
    editor: TldrawEditor,
  },
  data: {
    getInitialData: () => ({
      document: {
        store: {},
        schema: {
          schemaVersion: 2,
          sequences: {},
        },
      },
      session: {
        version: 0,
        currentPageId: "page:page",
      },
    }),
  },
});
