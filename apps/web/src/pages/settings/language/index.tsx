import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher/index";

import { SettingHeader } from "../components/setting-header";
import { SettingItem } from "../components/setting-item";

export const SettingsLanguagePage = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full p-6">
      <SettingHeader title={t("settings.language")} />
      <SettingItem title={t("settings.language")} description={t("settings.languageDescription")}>
        <LanguageSwitcher />
      </SettingItem>
    </div>
  );
};
