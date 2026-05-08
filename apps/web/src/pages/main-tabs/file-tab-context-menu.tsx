import type { BorderNode, TabNode, TabSetNode } from "flexlayout-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";

interface Props {
  node: TabNode | TabSetNode | BorderNode | null;
  x: number;
  y: number;
  menuItems: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (node: TabNode | TabSetNode | BorderNode | null, item: string) => void;
}

export const FileTabContextMenu = ({ node, x, y, menuItems, open, onOpenChange, onSelect }: Props) => {
  if (!node) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuContent className="fixed z-9999 min-w-30" style={{ top: y, left: x }}>
        {menuItems.map((item, index) => {
          if (item === "separator") {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }
          return (
            <DropdownMenuItem key={item} onSelect={() => onSelect(node, item)}>
              {item}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
