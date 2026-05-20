import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import JSZip from "jszip";
import { FileOutput } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CoFile } from "@/types/file";
import { Button } from "@workspace/ui/components/button";
import { selectedItemIdsAtom } from "@/store/jotai";
import { useFileDb } from "@/hooks/use-file-db";
import { useFileTreeQuery } from "@/hooks/use-file-tree-query";
import { saveFile } from "@/lib/file-system";
import { coFileRegistry } from "@/plugins/registry";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Tooltip } from "@/components/tooltip";

export const ExportFiles = () => {
  const { t } = useTranslation();
  const { fileTreeData } = useFileTreeQuery();
  const [selectedItemIds] = useAtom(selectedItemIdsAtom);
  const [selectedItems, setSelectedItems] = useState<CoFile[]>([]);
  const [open, setOpen] = useState(false);

  const fileDb = useFileDb();

  useEffect(() => {
    const selected = selectedItemIds
      ?.map((key) => fileTreeData[key]?.data)
      ?.filter((item): item is CoFile => item?.type !== "folder");
    queueMicrotask(() => setSelectedItems(selected));
  }, [fileTreeData, selectedItemIds]);

  const getData = useCallback(
    async (file: CoFile) => {
      if (!fileDb) return "";
      const row = await fileDb.get(file.id);
      if (!row?.data) return "";
      const data = row.data as Record<string, unknown>;
      // drawio stores { xml: string }, export the raw xml
      if ("xml" in data && typeof data.xml === "string" && Object.keys(data).length === 1) {
        return data.xml;
      }
      return JSON.stringify(data);
    },
    [fileDb],
  );

  const onExportFile = useCallback(async () => {
    const zip = new JSZip();

    for (const file of selectedItems) {
      const content = await getData(file);
      const suffix = coFileRegistry.get(file.type)?.meta.suffix ?? "";
      const idWithoutPrefix = file.id.replace(/^file_/, "");
      zip.file(`${file.name}_${idWithoutPrefix}${suffix}`, content as string);
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
