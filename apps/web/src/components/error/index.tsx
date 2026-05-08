import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Error = ({ message, className }: { message: string; className?: string }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600",
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
