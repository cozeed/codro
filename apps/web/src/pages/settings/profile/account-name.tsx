import { useEffect } from "react";
import { authClient } from "@/clients/auth-client";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as v from "valibot";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/spinner";

import { SettingItem } from "../components/setting-item";

export const AccountName = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const formSchema = v.object({
    name: v.pipe(v.string(), v.minLength(2, t("sign.fullNameError"))),
  });
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.updateUser({ name: value.name });
        toast.success(t("settings.saveNameSuccess"));
      } catch (error) {
        console.log(error);
        toast.error(`Error changing name: ${error}`);
      }
    },
  });
  useEffect(() => {
    form.setFieldValue("name", user?.name ?? "");
  }, [user, form]);

  return (
    <form
      className="flex flex-col gap-y-1"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <>
            <SettingItem title={t("settings.name")} />
            <Input
              className="mt-1 focus-visible:ring-1"
              id={field.name}
              type="text"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" variant="outline" disabled={!canSubmit} className="mt-1.5 w-[15%]">
            {isSubmitting ? <Spinner className="h-4 w-4 border-3" /> : `${t("settings.saveName")}`}
          </Button>
        )}
      />
      <Separator className="my-3" />
      <SettingItem title={t("settings.email")} />
      <Label className="text-base">{user?.email}</Label>
      <Separator className="my-3" />
    </form>
  );
};
