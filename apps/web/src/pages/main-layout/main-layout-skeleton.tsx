import { Skeleton } from "@workspace/ui/components/skeleton";

export const MainLayoutSkeleton = () => {
  return (
    <div className="flex h-full w-full">
      {/* Tree Skeleton */}
      <div className="border-border w-80 border-r p-6">
        <Skeleton className="h-full w-full rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-1 flex-col">
        {/* tab bar */}
        <div className="border-border flex h-10 items-center gap-4 border-b px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-sm" />
          ))}
        </div>

        {/* tab content */}
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};
