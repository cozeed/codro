import { useEffect, useState } from "react";
import { Eraser, ListPlus, PaintbrushVertical, Redo, ScanLine, Spline, Trash2, Undo, Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";
import type MindMap from "simple-mind-map";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/tooltip/index";

import { LineStyleMenu } from "./line-style-menu";
import { RainbowLinesMenu } from "./rainbow-lines-menu";
import { StructureMenu } from "./structure-menu";
import { SvgIcons } from "./svg-icons";
import { ThemeMenu } from "./theme-menu";

interface Props {
  className?: string;
  editor: MindMap;
}

export const MainToolbar = ({ className, editor }: Props) => {
  const { t } = useTranslation();
  const [backEnd, setBackEnd] = useState<boolean>(true);
  const [forwardEnd, setForwardEnd] = useState<boolean>(true);
  const [activeNodes, setActiveNodes] = useState<any>([]);

  const hasRoot = () => {
    return (
      activeNodes.findIndex((node: any) => {
        return node.isRoot;
      }) !== -1
    );
  };
  const hasGeneralization = () => {
    return (
      activeNodes.findIndex((node: any) => {
        return node.isGeneralization;
      }) !== -1
    );
  };
  // Listen for undo/redo
  const onBackForward = (index: number, len: number) => {
    setBackEnd(index <= 0);
    setForwardEnd(index >= len - 1);
  };
  // Listen for node activation
  const onNodeActive = (...args: any[]) => {
    setActiveNodes([...args[1]]);
  };
  useEffect(() => {
    editor.on("back_forward", onBackForward);
    editor.on("node_active", onNodeActive);
    return () => {
      editor.off("back_forward", onBackForward);
      editor.off("node_active", onNodeActive);
    };
  }, [editor]);

  return (
    <div
      className={cn("toolbar-container bg-background flex items-center space-x-1.5 rounded-lg border p-1", className)}
    >
      <Tooltip content={t("mindmap.toolbar.undo")} side="bottom" delay={200} className="">
        <Button
          disabled={backEnd}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("BACK")}
        >
          <Undo className="size-5" />
        </Button>
      </Tooltip>

      <Tooltip content={t("mindmap.toolbar.redo")} side="bottom" delay={200} className="">
        <Button
          disabled={forwardEnd}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("FORWARD")}
        >
          <Redo className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.painter")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => {
            editor.painter.startPainter();
          }}
        >
          <PaintbrushVertical className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.insertSiblingNode")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasRoot() || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("INSERT_NODE")}
        >
          <ListPlus className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.insertChildNode")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("INSERT_CHILD_NODE")}
        >
          <Workflow className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.deleteNode")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("REMOVE_NODE")}
        >
          <Trash2 className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.deleteCurrentNode")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("REMOVE_CURRENT_NODE")}
        >
          <Eraser className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.summary")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasRoot() || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("ADD_GENERALIZATION")}
        >
          <SvgIcons.summary className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.associativeLine")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => {
            editor.associativeLine.createLineFromActiveNode();
          }}
        >
          <Spline className="size-5" />
        </Button>
      </Tooltip>
      <Tooltip content={t("mindmap.toolbar.outerFrame")} side="bottom" delay={200} className="">
        <Button
          disabled={activeNodes.length <= 0 || hasGeneralization()}
          variant="outline"
          className="h-8 w-8 px-0"
          onClick={() => editor.execCommand("ADD_OUTER_FRAME")}
        >
          <ScanLine className="size-5" />
        </Button>
      </Tooltip>
      <Separator orientation="vertical" className="!h-8" />
      {/* structure menu */}
      <StructureMenu editor={editor} />
      {/* theme menu */}
      <ThemeMenu editor={editor} />
      {/* line style menu */}
      <LineStyleMenu editor={editor} />
      {/* rainbow lines menu */}
      <RainbowLinesMenu editor={editor} />
    </div>
  );
};
