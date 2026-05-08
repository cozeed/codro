import React, { useCallback } from "react";
import { useAtom } from "jotai";
import { FileType, FolderPlus, Palette, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CoFileType } from "@/types/file";
import { currentSidebarAtom } from "@/store/jotai";
import { useAddFile } from "@/hooks/use-add-file";
import { useAddFolder } from "@/hooks/use-add-folder";
import { useCurrentFolder } from "@/hooks/use-current-folder";
import { useTabJsonModel } from "@/hooks/use-tab-json-model";
import { Icons } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";
import { UserDropdown } from "@/components/user-dropdown";

interface IconButtonProps {
  className?: string;
  id?: string;
  onClick: (e: React.MouseEvent) => void;
  tooltip: string;
  Icon: React.ElementType;
  disabled?: boolean;
}

interface Props {
  className?: string;
}

const IconButton = ({ className, id, onClick, tooltip, Icon, disabled }: IconButtonProps) => {
  const { t } = useTranslation();
  return (
    <span
      className={`mb-5 flex items-center px-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
      id={id}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        onClick(e);
      }}
    >
      <Tooltip content={t(tooltip)} delay={0} side="right" className="">
        <div>
          <Icon
            className={`size-6 text-gray-500 transition-colors duration-200 hover:brightness-75 dark:text-gray-400 dark:hover:brightness-125`}
          />
        </div>
      </Tooltip>
    </span>
  );
};

export const LeftToolbar = ({ className }: Props) => {
  const { addFile, isAdding: isAddingFile } = useAddFile();
  const { addFolder, isAdding: isAddingFolder } = useAddFolder();
  const { t } = useTranslation();
  const { switchToSettingPage, tabModel } = useTabJsonModel();
  const { currentFolderId } = useCurrentFolder();
  const [currentSidebar, setCurrentSidebar] = useAtom(currentSidebarAtom);

  const handleAddFile = useCallback(
    (name: string, type: CoFileType) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentSidebar === "chat") setCurrentSidebar("main");
      else addFile(name, type, tabModel, currentFolderId);
    },
    [currentSidebar, setCurrentSidebar, addFile, tabModel, currentFolderId],
  );
  const handleAddFolder = useCallback(
    (name: string = "New Folder") =>
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentSidebar === "chat") setCurrentSidebar("main");
        else addFolder(name, currentFolderId);
      },
    [currentSidebar, setCurrentSidebar, addFolder, currentFolderId],
  );

  const onSettingsClick = useCallback(() => {
    switchToSettingPage(tabModel);
  }, [switchToSettingPage, tabModel]);

  const fileButtons = [
    { id: "add-board", name: "New Excalidraw", type: "board", tooltip: "operation.addBoard", Icon: Palette },
    { id: "add-tldraw", name: "New Tldraw", type: "tldraw", tooltip: "operation.addTldraw", Icon: Icons.tldraw },
    { id: "add-drawio", name: "New Drawio", type: "drawio", tooltip: "operation.addDrawio", Icon: Icons.drawio },
    { id: "add-mindmap", name: "New Mindmap", type: "mindmap", tooltip: "operation.addMindmap", Icon: Icons.mindmap },
    { id: "add-note", name: "New Note", type: "note", tooltip: "operation.addNote", Icon: FileType },
  ];

  return (
    <div className={`flex w-10 flex-col items-center justify-between border-r px-2 py-3 ${className}`}>
      <div className="flex flex-col items-center">
        <IconButton
          onClick={handleAddFolder()}
          tooltip="operation.addFolder"
          Icon={FolderPlus}
          disabled={isAddingFolder}
        />
        {fileButtons.map(({ id, name, type, tooltip, Icon }) => (
          <IconButton
            key={id}
            id={id}
            onClick={handleAddFile(name, type as CoFileType)}
            tooltip={tooltip}
            Icon={Icon}
            disabled={isAddingFile}
          />
        ))}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSidebar("chat");
          }}
          tooltip="operation.aiCreate"
          Icon={Icons.chat}
        />
      </div>
      <div className="flex flex-col items-center pb-4">
        <span className="mb-5 flex cursor-pointer items-center px-2">
          <UserDropdown />
        </span>
        <span className="mb-5 flex cursor-pointer items-center px-2">
          <Tooltip content={t("operation.systemSetting")} delay={0} side="right" className="">
            <Settings
              className={`size-6 text-gray-500 transition-colors duration-200 hover:brightness-75 dark:text-gray-400 dark:hover:brightness-125`}
              onClick={() => {
                onSettingsClick();
              }}
            />
          </Tooltip>
        </span>
      </div>
    </div>
  );
};
