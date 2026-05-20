import { useCallback } from "react";
import { FileInput } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { useAddFile } from "@/hooks/use-add-file";
import { useCurrentFolder } from "@/hooks/use-current-folder";
import { useTabJsonModel } from "@/hooks/use-tab-json-model";
import { coFileRegistry } from "@/plugins/registry";
import { Tooltip } from "@/components/tooltip";

const FILE_NAME_REGEX = /^(.+)(\.[a-zA-Z0-9]+)$/;

export const ImportFiles = () => {
  const { t } = useTranslation();
  const { addFile } = useAddFile();
  const { currentFolderId } = useCurrentFolder();
  const { tabModel } = useTabJsonModel();

  const importFile = useCallback(
    async (fileHandle: FileSystemFileHandle, folderId: string) => {
      const localFile = await fileHandle.getFile();
      const fileContent = await localFile.text();

      const matches = localFile.name.match(FILE_NAME_REGEX);
      const fileName = matches?.[1] as string;
      const fileSuffix = matches?.[2] as string;

      const fileType = coFileRegistry.getBySuffix(fileSuffix)?.id;
      if (fileType) {
        await addFile(fileName, fileType, tabModel, folderId, fileContent);
      }
    },
    [tabModel, addFile],
  );

  const onImportFile = useCallback(async () => {
    const folderId = currentFolderId ?? "root";
    if (!window.showOpenFilePicker) {
      console.error("File picker not supported");
      return;
    }
    const fileHandles = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: "Codro",
          accept: {
            "application/x-codro": coFileRegistry.getSuffixes(),
          },
        },
      ],
    });

    for await (const fileHandle of fileHandles) {
      await importFile(fileHandle, folderId);
    }
  }, [currentFolderId, importFile]);

  return (
    <Tooltip content={t("operation.import")} delay={0} side="bottom" sideOffset={-4} className="">
      <Button onClick={onImportFile} variant="ghost" className="size-7 text-sm">
        <FileInput className="size-5" />
      </Button>
    </Tooltip>
  );
};
