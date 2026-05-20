import React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { definePlugin } from "./types";

const DrawioEditor = React.lazy(() =>
  import("@/components/drawio-editor").then((m) => ({ default: m.DrawioEditor })),
);
const DrawioDiagram = React.lazy(() =>
  import("@/components/assistant-ui/drawio-diagram").then((m) => ({ default: m.DrawioDiagram })),
);

export const drawioPlugin = definePlugin({
  id: "drawio",
  meta: {
    displayName: "Drawio",
    defaultFileName: "New Drawio",
    suffix: ".drawio",
    tooltip: "operation.addDrawio",
    icon: ({ className }) => <Icons.drawio className={cn("size-4 text-amber-600 dark:text-amber-500", className)} />,
  },
  components: {
    editor: DrawioEditor,
    diagram: DrawioDiagram,
  },
  data: {
    getInitialData: () => ({ xml: "" }),
    deserialize: (content: string) => ({ xml: content }),
  },
});
