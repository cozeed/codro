import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import type { FileTreeContextMenuItem } from "@/hooks/use-file-tree-context-menu";

interface Props {
  x: number;
  y: number;
  menuItems: FileTreeContextMenuItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FileTreeContextMenu = ({ x, y, menuItems, open, onOpenChange }: Props) => {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuContent
        className="fixed z-9999 min-w-52.5"
        style={{ top: y, left: x }}
        onEscapeKeyDown={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
      >
        {menuItems.map((item, index) => {
          if (item.type === "divider") {
            return <DropdownMenuSeparator key={index} />;
          }
          return (
            <DropdownMenuItem key={item.key} onSelect={item.onSelect} className="flex h-8 items-center space-x-0">
              {item.icon}
              <div>{item.label}</div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
