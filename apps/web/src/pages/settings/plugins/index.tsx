import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Switch } from "@workspace/ui/components/switch";
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { disabledPluginIdsAtom } from "@/store/jotai";
import { coFileRegistry } from "@/plugins/registry";
import { SettingHeader } from "../components/setting-header";

export const SettingsPluginsPage = () => {
  const { t } = useTranslation();
  const [disabledIds] = useAtom(disabledPluginIdsAtom);
  const plugins = coFileRegistry.listAll();

  return (
    <div className="h-full w-full p-6">
      <SettingHeader title={t("settings.plugins")} subtitle={t("settings.pluginsDescription")} />

      <div className="space-y-3">
        {plugins.map((plugin) => {
          const enabled = !disabledIds.includes(plugin.id);
          const Icon = plugin.meta.icon;

          return (
            <Card key={plugin.id} className="py-5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-md border">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle>{plugin.meta.displayName}</CardTitle>
                </div>
                <Switch
                  className="scale-125"
                  size="default"
                  checked={enabled}
                  onCheckedChange={(checked) => {
                    coFileRegistry.setEnabled(plugin.id, checked);
                  }}
                />
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
