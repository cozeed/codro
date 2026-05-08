import { modelProviders, type ModelProviderType } from "@/types/model-provider";
import type { ModelProviderItem } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";

interface Props {
  providerItems: ModelProviderItem[];
  curProviderType: ModelProviderType;
  setCurProviderType: (providerType: ModelProviderType) => void;
  className?: string;
}

export const ProviderSelector = ({ providerItems, curProviderType, setCurProviderType, className }: Props) => {
  return (
    <div className={cn("bg-background col-span-2 h-full border-r pt-4", className)}>
      <nav className="flex flex-col space-y-1 px-2 py-2">
        {providerItems.map((p) => {
          const Icon = modelProviders[p.name as ModelProviderType]?.icon;
          return (
            <Button
              key={p.name}
              variant="ghost"
              onClick={() => setCurProviderType(p.name as ModelProviderType)}
              className={cn(
                curProviderType === p.name
                  ? "bg-accent text-primary border"
                  : "border border-transparent bg-transparent",
                "text-foreground hover:bg-accent flex h-10 cursor-pointer items-center justify-start gap-3 rounded-md px-4 text-base font-medium transition-colors",
              )}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span>{p.name}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
