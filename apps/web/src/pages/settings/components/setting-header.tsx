import type { ReactNode } from "react";
import { Separator } from "@workspace/ui/components/separator";

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
}

export const SettingHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-4">
      <div className="text-muted-foreground text-2xl leading-10 font-semibold tracking-tight">{title}</div>
      {subtitle ? <div className="text-muted-foreground mt-1 text-lg leading-8">{subtitle}</div> : null}
      <Separator className="mt-2" />
    </div>
  );
};
