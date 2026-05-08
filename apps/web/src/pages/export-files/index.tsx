import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import JSZip from "jszip";
import { FileOutput } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CoFile } from "@/types/file";
import { FILE_SUFFIX_MAP } from "@/types/file";
import { Button } from "@workspace/ui/components/button";
import { selectedItemIdsAtom } from "@/store/jotai";
import { useBoardDb } from "@/hooks/use-board-db";
import { useDrawioDb } from "@/hooks/use-drawio-db";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { useMindmapDb } from "@/hooks/use-mindmap-db";
import { useNoteDb } from "@/hooks/use-note-db";
import { useTldrawDb } from "@/hooks/use-tldraw-db";
import { saveFile } from "@/lib/file-system";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Tooltip } from "@/components/tooltip";

export const ExportFiles = () => {
  const { t } = useTranslation();
  const { fileTreeData } = useFileTreeQuery();
  const [selectedItemIds] = useAtom(selectedItemIdsAtom);
  const [selectedItems, setSelectedItems] = useState<CoFile[]>([]);
  const [open, setOpen] = useState(false);

  const boardDb = useBoardDb();
  const tldrawDb = useTldrawDb();
  const noteDb = useNoteDb();
  const mindmapDb = useMindmapDb();
  const drawioDb = useDrawioDb();

  useEffect(() => {
    const selected = selectedItemIds
      ?.map((key) => fileTreeData[key]?.data)
      ?.filter((item): item is CoFile => item?.type !== "folder");
    queueMicrotask(() => setSelectedItems(selected));
  }, [fileTreeData, selectedItemIds]);

  const getData = useCallback(
    async (file: CoFile) => {
      const { type, id } = file;
      switch (type) {
        case "note": {
          const data = await noteDb?.getNote(id);
          return JSON.stringify(data);
        }
        case "board": {
          const data = await boardDb?.getBoard(id);
          return JSON.stringify(data);
        }
        case "tldraw": {
          const data = await tldrawDb?.getTldraw(id);
          return JSON.stringify(data);
        }
        case "mindmap": {
          const data = await mindmapDb?.getMind(id);
          return JSON.stringify(data);
        }
        case "drawio": {
          const data = await drawioDb?.getDrawio(id);
          return data;
        }
      }
      return "";
    },
    [boardDb, drawioDb, mindmapDb, noteDb, tldrawDb],
  );

  const onExportFile = useCallback(async () => {
    const zip = new JSZip();

    for (const file of selectedItems) {
      const content = await getData(file);
      const idWithoutPrefix = file.id.replace(/^file_/, "");
      zip.file(`${file.name}_${idWithoutPrefix}${FILE_SUFFIX_MAP[file.type]}`, content as string);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    await saveFile(blob, "coexport.zip");
  }, [selectedItems, getData]);

  return (
    <>
      <Tooltip content={t("operation.export")} delay={0} side="bottom" sideOffset={-4}>
        <Button
          onClick={() => {
            if (selectedItems.length === 0) return;
            setOpen(true);
          }}
          variant="ghost"
          className="size-7 text-sm"
        >
          <FileOutput className="size-5" />
        </Button>
      </Tooltip>
      <ConfirmDialog
        title="Codro"
        description={`${t("confirm.confirmExport", { count: selectedItems.length })}`}
        open={open}
        onOpenChange={setOpen}
        onOk={async () => {
          setOpen(false);
          await onExportFile();
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};
