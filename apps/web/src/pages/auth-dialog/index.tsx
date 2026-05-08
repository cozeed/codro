import { useEffect, useState } from "react";
import { authClient } from "@/clients/auth-client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { isTauriApp } from "@/lib/navigator";
import { env } from "@/env";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { SignInForm, SignUpForm } from "@/components/auth-form";
import { Icons } from "@/components/icons";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "login" | "register";
}

export const AuthDialog = ({ open, setOpen, mode }: Props) => {
  const { t } = useTranslation();
  const [currentMode, setCurrentMode] = useState<"login" | "register">(mode);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => setCurrentMode(mode));
    }
  }, [open, mode]);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setCurrentMode(newMode);
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    try {
      if (isTauriApp()) {
        const { invoke } = await import("@tauri-apps/api/core");

        const port = await invoke<number>("start_oauth_server");
        const callbackURL = `${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/tauri-auth-bridge?port=${port}`;

        const res = await authClient.signIn.social({
          provider,
          callbackURL,
          disableRedirect: true,
        });
        const url = (res as Record<string, any>)?.data?.url as string | undefined;
        if (!url) {
          toast.error(t("sign.signInFail"));
          return;
        }

        const { open } = await import("@tauri-apps/plugin-shell");
        await open(url);

        let attempts = 0;
        const checkInterval = setInterval(async () => {
          attempts++;
          if (attempts > 180) {
            clearInterval(checkInterval);
            toast.error(t("sign.signInFail"));
            return;
          }
          const token = await invoke<string | null>("take_oauth_token");
          if (token) {
            clearInterval(checkInterval);
            await fetch(
              `${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/set-session?token=${encodeURIComponent(token)}`,
              { credentials: "include" },
            );
            await authClient.getSession();
            window.location.reload();
          }
        }, 1000);
      } else {
        const { error } = await authClient.signIn.social({
          provider,
          callbackURL: window.location.origin,
        });
        if (error) {
          toast.error(error.message ?? t("sign.signInFail"));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(t("sign.signInFail"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="gap-1">
        <div className="flex flex-col items-center gap-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
            <Icons.logo className="size-8 rounded-full" />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              {currentMode === "login" ? t("sign.signInTitle") : t("sign.signUpTitle")}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {currentMode === "login" ? t("sign.signInDescription") : t("sign.signUpDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {currentMode === "login" ? (
          <>
            <SignInForm onSuccess={() => setOpen(false)} />
            <div className="mt-1 text-center text-sm">
              {t("sign.notHaveAccount")}{" "}
              <Button variant="link" onClick={() => handleSwitchMode("register")}>
                {t("sign.signUp")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <SignUpForm onSuccess={() => setOpen(false)} />
            <div className="mt-1 text-center text-sm">
              {t("sign.alreadyHaveAccount")}{" "}
              <Button variant="link" onClick={() => handleSwitchMode("login")}>
                {t("sign.signIn")}
              </Button>
            </div>
          </>
        )}

        <div className="before:bg-border after:bg-border my-1 flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
          <span className="text-muted-foreground text-xs">{t("sign.orContinue")}</span>
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={() => handleSocialAuth("google")}>
          <Icons.google /> {t("sign.continueWithGoogle")}
        </Button>
        <Button variant="outline" className="w-full gap-2" onClick={() => handleSocialAuth("github")}>
          <Icons.github /> {t("sign.continueWithGithub")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
