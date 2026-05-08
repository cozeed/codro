import { useContext } from "react";
import { FileTreeDBContext, type FileTreeDBContextValue } from "@/providers/file-tree-db-provider";

export function useFileTreeQuery(): FileTreeDBContextValue {
  const context = useContext(FileTreeDBContext);
  return context;
}
