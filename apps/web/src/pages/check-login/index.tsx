import React, { useState } from "react";
import { AuthDialog } from "@/pages/auth-dialog";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const CheckLogin = ({ className, children }: Props) => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col">
      {!isLoggedIn && (
        <div className="py-0.5">
          <Button variant="outline" size="lg" className="w-full" onClick={() => setAuthOpen(true)}>
            <LogIn className="mr-2 h-4 w-4" />
            {t("settings.signIn")}
          </Button>
        </div>
      )}
      <div className={cn("flex-1", isLoggedIn ? "" : "pointer-events-none pt-1 opacity-40", className)}>{children}</div>
      <AuthDialog open={authOpen} setOpen={setAuthOpen} mode="login" />
    </div>
  );
};
