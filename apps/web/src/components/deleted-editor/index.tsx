import { useTranslation } from "react-i18next";
import { Card, CardHeader } from "@workspace/ui/components/card";

export const DeletedEditor = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-background absolute inset-0 z-10 flex items-center justify-center p-4">
      <Card className="h-full w-full rounded-lg border bg-neutral-100 p-8 shadow-xl dark:bg-neutral-900">
        <CardHeader className="flex grow flex-col items-center justify-center text-center">
          <p className="mb-4 text-lg text-neutral-900 dark:text-neutral-100">{t("operation.fileDeleted")}</p>
        </CardHeader>
      </Card>
    </div>
  );
};
