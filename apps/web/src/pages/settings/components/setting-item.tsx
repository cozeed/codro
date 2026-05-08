import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface Props {
  title: string;
  description?: string;
  mini?: boolean;
  className?: string;
}

export const SettingItem = ({ title, description, mini, className, ...props }: PropsWithChildren<Props>) => {
  return (
    <>
      <div className={clsx("relative flex flex-row", !props.children ? "mb-0" : "mb-4", className)}>
        <div className={clsx("flex h-auto flex-col", mini ? "w-auto" : "w-full")}>
          <h3
            className={clsx(
              "text-foreground flex items-center text-base font-semibold",
              description ? "h-auto" : "h-full",
            )}
          >
            {title}
          </h3>

          {description && <p className={clsx("text-muted-foreground text-sm")}>{description}</p>}
          {!mini && props.children && <div className={clsx("mt-2 w-full")}>{props.children}</div>}
        </div>
        {mini && <div className="flex-1 pl-10">{props.children}</div>}
      </div>
    </>
  );
};
