import { useTranslation } from "react-i18next";
import { modelProviders, type ModelProviderType } from "@/types/model-provider";
import type { ModelProviderItem } from "@workspace/db/schema";
import { Badge } from "@workspace/ui/components/badge";

interface Props {
  curProviderItem: ModelProviderItem;
}

export const ModelList = ({ curProviderItem }: Props) => {
  const { t } = useTranslation();
  const Icon = modelProviders[curProviderItem.name as ModelProviderType]?.icon;
  const modelList = curProviderItem.models.split(",").map((model: string) => model.trim());

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-4 text-lg font-semibold">
        {t("settings.modelList")}
        <span className="text-muted-foreground text-sm font-normal">
          {t("settings.modelCount", { count: modelList.length })}
        </span>
      </h3>

      <div className="space-y-4">
        {modelList.map((model: string) => (
          <div key={model} className="flex items-center gap-4">
            {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
            <div className="flex items-center gap-2 font-medium">
              <span>{model}</span>
              <Badge variant="secondary">{model}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
