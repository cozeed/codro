import { useEffect, useState } from "react";
import { authClient } from "@/clients/auth-client";
import { SettingItem } from "@/pages/settings/components/setting-item";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as v from "valibot";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@/components/spinner";

import FormFieldInfo from "./form-field-info";

export const ChangePassword = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const formSchema = v.object({
    oldPassword: v.pipe(v.string(), v.minLength(8, t("sign.passwordError"))),
    newPassword: v.pipe(v.string(), v.minLength(8, t("sign.passwordError"))),
  });

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await authClient.changePassword({
          newPassword: value.newPassword,
          currentPassword: value.oldPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          toast.error(error.message ?? JSON.stringify(error));
          return;
        }
        toast.success(t("sign.changePasswordSuccess"));
        setOpen(false);
      } catch (error) {
        console.error(t("sign.changePasswordError"), error);
        toast.error(t("sign.changePasswordError"));
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [open, form]);

  return (
    <div className="flex items-start justify-between gap-x-6">
      <div>
        <SettingItem
          mini={true}
          title={t("settings.password")}
          description={t("settings.passwordDescription")}
        ></SettingItem>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{t("settings.changePassword")}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.changePassword")}</DialogTitle>
          </DialogHeader>

          <form
            className="flex flex-col gap-y-1"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="oldPassword"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>{t("sign.currentPassword")}</Label>
                  <div className="mt-1 w-full">
                    <Input
                      className="focus-visible:ring-1"
                      id={field.name}
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("sign.currentPasswordDescription")}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FormFieldInfo field={field} />
                </>
              )}
            />

            <form.Field
              name="newPassword"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>{t("sign.newPassword")}</Label>
                  <div className="mt-1 w-full">
                    <Input
                      className="focus-visible:ring-1"
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder={t("sign.newPasswordDescription")}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FormFieldInfo field={field} />
                </>
              )}
            />

            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} className="mt-2 h-10 w-full">
                  {isSubmitting ? <Spinner /> : t("settings.changePassword")}
                </Button>
              )}
            />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
