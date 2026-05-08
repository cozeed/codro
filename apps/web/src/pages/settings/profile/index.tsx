import { useState } from "react";
import { AuthDialog } from "@/pages/auth-dialog";
import { CheckLogin } from "@/pages/check-login";
import { useTranslation } from "react-i18next";
import { ChangePassword } from "@/components/auth-form/change-password";

import { SettingHeader } from "../components/setting-header";
import { AccountAvatar } from "./account-avatar";
import { AccountName } from "./account-name";

export const SettingsProfilePage = () => {
  const { t } = useTranslation();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div className="h-full w-full p-6">
        <SettingHeader title={t("settings.profile")} subtitle="" />
        <CheckLogin>
          <AccountAvatar />
          <AccountName />
          <ChangePassword />
        </CheckLogin>
      </div>
      <AuthDialog open={authOpen} setOpen={setAuthOpen} mode={"login"} />
    </>
  );
};
