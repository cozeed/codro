import { useTranslation } from "react-i18next";

import { SettingHeader } from "../components/setting-header";
import { SettingItem } from "../components/setting-item";
import { SettingTheme } from "../components/setting-theme";

export const SettingsAppearancePage = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full p-6">
      <SettingHeader title={t("settings.appearance")} />

      <SettingItem title={t("settings.theme")}>
        <SettingTheme />
      </SettingItem>
    </div>
  );
};
