import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as v from "valibot";
import { trpc } from "@workspace/api/client";
import type { ModelProviderItem } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/spinner";

import { SettingHeader } from "../components/setting-header";
import { ModelList } from "./model-list";

interface Props {
  curProviderItem: ModelProviderItem;
  className?: string;
}

export const ProviderConfig = ({ curProviderItem, className }: Props) => {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const updateMutation = trpc.modelProviders.update.useMutation({
    onSuccess: () => {
      toast.success(t("settings.saveSuccess"));
      utils.modelProviders.invalidate(); // invalidate all modelProviders query caches
    },
    onError: (error) => {
      toast.error(`save failed：${error.message}`);
    },
  });

  const formSchema = v.object({
    apiKey: v.pipe(v.string()),
    baseUrl: v.pipe(v.string(), v.minLength(1, "API proxy URL cannot be empty")),
    models: v.pipe(v.string(), v.minLength(1, "Available models cannot be empty")),
  });

  const form = useForm({
    defaultValues: {
      apiKey: curProviderItem.apiKey || "",
      baseUrl: curProviderItem.baseUrl || "",
      models: curProviderItem.models || "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate({
        id: curProviderItem.id,
        name: curProviderItem.name,
        apiKey: value.apiKey,
        baseUrl: value.baseUrl,
        models: value.models,
        sort: curProviderItem.sort,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn("col-span-6 p-6", className)}
    >
      <SettingHeader title={t("settings.provider")} subtitle="" />

      <div className="space-y-6 py-2">
        <div className="space-y-4">
          <form.Field
            name="apiKey"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="text-base font-semibold">
                  {t("settings.apiKey")}
                </Label>
                <Input
                  id={field.name}
                  type="password"
                  name="new-api-key"
                  autoComplete="one-time-code"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={`${curProviderItem.name} API Key`}
                  className="focus-visible:ring-1"
                />
                <p className="text-muted-foreground text-sm">{t("settings.apiKeyDescription")}</p>
              </div>
            )}
          />

          <form.Field
            name="baseUrl"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="text-base font-semibold">
                  {t("settings.baseUrl")}
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://your-api-proxy.example.com"
                  className="focus-visible:ring-1"
                />
              </div>
            )}
          />
          <form.Field
            name="models"
            children={(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name} className="text-base font-semibold">
                  {t("settings.models")}
                </Label>
                <Input
                  id={field.name}
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="gpt-4o,gpt-4o-mini"
                  className="focus-visible:ring-1"
                />
                <p className="text-muted-foreground text-sm">{t("settings.modelsDescription")}</p>
              </div>
            )}
          />
        </div>

        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex justify-end pr-6">
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? <Spinner /> : t("settings.saveProvider")}
              </Button>
            </div>
          )}
        />
      </div>
      <Separator className="my-4" />
      {curProviderItem.models?.length > 0 && <ModelList curProviderItem={curProviderItem} />}
    </form>
  );
};
