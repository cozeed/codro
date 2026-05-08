import { authClient } from "@/clients/auth-client";
import { useForm } from "@tanstack/react-form";
import { Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as v from "valibot";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

import { Spinner } from "../spinner";
import FormFieldInfo from "./form-field-info";

interface Props {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: Props) {
  const { t } = useTranslation();
  const formSchema = v.object({
    email: v.pipe(v.string(), v.email(t("sign.emailError"))),
    password: v.pipe(v.string(), v.minLength(8, t("sign.passwordError"))),
  });
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { error, data } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });
        if (error) {
          toast.error(error.message ?? JSON.stringify(error));
          return;
        }
        toast.success(t("sign.signInSuccess", { name: data?.user.name }));
        onSuccess?.();
      } catch (error) {
        console.error("Error signing in", error);
        toast.error(t("sign.signInFail"));
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-y-1"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div>
        <form.Field
          name="email"
          children={(field) => {
            return (
              <>
                <Label htmlFor={field.name}>{t("sign.email")}</Label>
                <div className="relative mt-1">
                  <Input
                    className="peer ps-10 focus-visible:ring-1"
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <Mail size={16} strokeWidth={2} aria-hidden="true" />
                  </div>
                </div>
                <FormFieldInfo field={field} />
              </>
            );
          }}
        />
      </div>
      <div>
        <form.Field
          name="password"
          children={(field) => (
            <>
              <Label htmlFor={field.name}>{t("sign.password")}</Label>
              <div className="relative mt-1">
                <Input
                  className="peer ps-10 focus-visible:ring-1"
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <Lock size={16} strokeWidth={2} aria-hidden="true" />
                </div>
              </div>
              <FormFieldInfo field={field} />
            </>
          )}
        />
      </div>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit} className="mt-2 h-10">
            {isSubmitting ? <Spinner /> : t("sign.signIn")}
          </Button>
        )}
      />
    </form>
  );
}
