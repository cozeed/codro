import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  withText?: boolean;
}

export const Spinner = ({ className, withText = false }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <div
        className={cn("border-ring/50 h-6 w-6 animate-spin rounded-full border-4 border-t-blue-500", className)}
      ></div>
      {withText && <p className="text-muted-foreground text-sm">{t("message.loading")}</p>}
    </div>
  );
};
