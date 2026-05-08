import type { FC } from "react";
import { AuiIf, ThreadListItemMorePrimitive, ThreadListItemPrimitive, ThreadListPrimitive } from "@assistant-ui/react";
import { useAtom } from "jotai";
import { ArchiveIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { showThreadListAtom } from "@/store/jotai";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <AuiIf condition={({ threads }) => threads.isLoading}>
        <ThreadListSkeleton />
      </AuiIf>
      <AuiIf condition={({ threads }) => !threads.isLoading}>
        <ThreadListPrimitive.Items>{() => <ThreadListItem />}</ThreadListPrimitive.Items>
      </AuiIf>
    </ThreadListPrimitive.Root>
  );
};
const ThreadListNew: FC = () => {
  const { t } = useTranslation();
  const [, setShowThreadList] = useAtom(showThreadListAtom);
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        variant="outline"
        className="aui-thread-list-new hover:bg-muted data-active:bg-muted h-9 justify-start gap-2 rounded-lg px-3 text-sm"
        onClick={() => setShowThreadList(false)}
      >
        <PlusIcon className="size-4" />
        {t("operation.newThread")}
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListSkeleton: FC = () => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          className="aui-thread-list-skeleton-wrapper flex h-9 items-center px-3"
        >
          <Skeleton className="aui-thread-list-skeleton h-4 w-full" />
        </div>
      ))}
    </div>
  );
};

const ThreadListItem: FC = () => {
  const { t } = useTranslation();
  const [, setShowThreadList] = useAtom(showThreadListAtom);
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item group hover:bg-muted focus-visible:bg-muted data-active:bg-muted flex h-9 items-center gap-2 rounded-lg transition-colors focus-visible:outline-none">
      <ThreadListItemPrimitive.Trigger
        className="aui-thread-list-item-trigger flex h-full min-w-0 flex-1 items-center truncate px-3 text-start text-sm"
        onClick={() => setShowThreadList(false)}
      >
        <ThreadListItemPrimitive.Title fallback={t("operation.newThread")} />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemMore />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemMore: FC = () => {
  const { t } = useTranslation();
  return (
    <ThreadListItemMorePrimitive.Root>
      <ThreadListItemMorePrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="aui-thread-list-item-more data-[state=open]:bg-accent mr-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100 group-data-active:opacity-100 data-[state=open]:opacity-100"
        >
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">More options</span>
        </Button>
      </ThreadListItemMorePrimitive.Trigger>
      <ThreadListItemMorePrimitive.Content
        side="bottom"
        align="start"
        className="aui-thread-list-item-more-content bg-popover text-popover-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md"
      >
        <ThreadListItemPrimitive.Archive asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none">
            <ArchiveIcon className="size-4" />
            {t("operation.archiveThread")}
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Archive>
        <ThreadListItemPrimitive.Delete asChild>
          <ThreadListItemMorePrimitive.Item className="aui-thread-list-item-more-item text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none">
            <TrashIcon className="size-4" />
            {t("operation.deleteThread")}
          </ThreadListItemMorePrimitive.Item>
        </ThreadListItemPrimitive.Delete>
      </ThreadListItemMorePrimitive.Content>
    </ThreadListItemMorePrimitive.Root>
  );
};
