import React from "react";
import { FileType } from "lucide-react";
import { cn } from "@/lib/utils";
import { definePlugin } from "./types";

const NoteEditor = React.lazy(() => import("@/components/note-editor").then((m) => ({ default: m.NoteEditor })));
const NoteDiagram = React.lazy(() =>
  import("@/components/assistant-ui/note-diagram").then((m) => ({ default: m.NoteDiagram })),
);

export const notePlugin = definePlugin({
  id: "note",
  meta: {
    displayName: "Note",
    defaultFileName: "New Note",
    suffix: ".note",
    tooltip: "operation.addNote",
    icon: ({ className }) => <FileType className={cn("size-4 text-blue-600 dark:text-blue-400", className)} />,
  },
  components: {
    editor: NoteEditor,
    diagram: NoteDiagram,
  },
  data: {
    getInitialData: () => [{ type: "paragraph", content: "" }],
  },
});
