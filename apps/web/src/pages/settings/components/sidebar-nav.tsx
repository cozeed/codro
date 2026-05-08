import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { cn } from "@/lib/utils";

interface Props {
  items: {
    title: string;
    icon: React.ReactNode;
    component: React.ReactNode;
  }[];
  className?: string;
  activeTitle: string;
  setActiveTitle: (title: string) => void;
}

export const SidebarNav = ({ className, items, activeTitle, setActiveTitle }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full p-2 pt-4 md:hidden">
        <Select value={activeTitle} onValueChange={(e) => setActiveTitle(e)}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="Setting" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.title} value={item.title}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{t(`settings.${item.title.toLowerCase()}`)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea type="always" className="bg-background hidden w-full min-w-40 p-2 pt-4 md:block">
        <nav className={cn("flex space-y-2 px-2 py-2 lg:flex-col lg:space-y-1 lg:space-x-0", className)}>
          {items.map((item, index) => (
            <Button
              key={index}
              variant={"ghost"}
              aria-selected="true"
              onClick={() => setActiveTitle(item.title)}
              className={cn(
                activeTitle === item.title
                  ? "bg-accent text-primary border"
                  : "border border-transparent bg-transparent",
                "text-foreground hover:bg-accent h-10 cursor-pointer justify-start rounded-md text-base font-medium transition-colors",
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {t(`settings.${item.title.toLowerCase()}`)}
            </Button>
          ))}
        </nav>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </>
  );
};
