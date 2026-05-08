import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

type StatsCardProps = {
  title: string;
  value: number;
  icon?: ReactNode;
  color?: string;
};

export const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  return (
    <Card className="@container/card transition-all hover:shadow-sm">
      <CardHeader className="gap-2">
        <CardDescription className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          {icon && <span className="flex h-6 w-6 items-center justify-center rounded-md bg-transparent">{icon}</span>}

          <span className="tracking-tight">{title}</span>
        </CardDescription>

        <CardTitle className={cn("pl-1 text-3xl font-semibold tracking-tight tabular-nums @[250px]/card:text-4xl", color)}>
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
