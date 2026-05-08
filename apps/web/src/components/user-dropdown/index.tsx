import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/clients/auth-client";
import { AuthDialog } from "@/pages/auth-dialog";
import { getFileUrl } from "@/services/storage-service";
import { ArrowUpRightFromCircle, CircleUserRound, DownloadCloud, LogIn, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Icons } from "@/components/icons";
import { Tooltip } from "@/components/tooltip";
import { CustomAvatar } from "../custom-avatar";

interface UserProps {
  name: string;
  email: string;
  image: string;
}

const UserInfo = ({ name, email, image }: UserProps) => {
  const [fileUrl, setFileUrl] = useState<string>("");

  useEffect(() => {
    if (!image) return;

    let cancelled = false;

    (async () => {
      const result = await getFileUrl(image);
      if (!cancelled) {
        setFileUrl(result.data.fileUrl);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [image]);

  const resolvedFileUrl = image ? fileUrl : "";

  return (
    <div className="flex items-center gap-2 px-1 py-1 text-left text-sm">
      <CustomAvatar image={resolvedFileUrl} name={name} size="md" className="bg-blue-400 text-white" />
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </div>
  );
};

export const UserDropdown = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        key: "github",
        icon: <Icons.github className="w-4" />,
        label: t("help.viewGitHub"),
        link: "https://github.com/cozeed/codro",
      },
      {
        key: "issue",
        icon: <ArrowUpRightFromCircle className="w-4" />,
        label: t("help.issue"),
        link: "https://github.com/cozeed/codro/issues/new",
      },
      {
        key: "x",
        icon: <Icons.x className="w-4" />,
        label: t("help.x"),
        link: "https://x.com/cozeed_app",
      },
      {
        key: "downloadApp",
        icon: <DownloadCloud className="w-4 animate-bounce" />,
        label: t("help.downloadApp"),
        link: "https://github.com/cozeed/codro/releases",
      },
    ],
    [t],
  );

  const onSignIn = () => {
    setAuthOpen(true);
  };

  const onSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message ?? JSON.stringify(error));
        return;
      }
      toast.success(t("sign.signOutSuccess"));
    } catch (error) {
      console.error("Error signing out", error);
      toast.error(t("sign.signOutFail"));
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="pointer-events-auto flex items-center justify-center">
            <Tooltip content={t("operation.accountMenu")} delay={0} side="right">
              {user ? (
                <CustomAvatar
                  image={user.image ?? ""}
                  name={user.name ?? ""}
                  size="sm"
                  className="cursor-pointer bg-blue-400 text-white"
                />
              ) : (
                <CircleUserRound className="size-6 text-gray-500 transition-colors duration-200 hover:brightness-75 dark:text-gray-400 dark:hover:brightness-125" />
              )}
            </Tooltip>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="z-9999 max-w-56" side="right" align="end">
          {user?.email ? (
            <DropdownMenuLabel className="p-0 font-normal">
              <UserInfo name={user.name ?? ""} email={user.email} image={user.image ?? ""} />
            </DropdownMenuLabel>
          ) : (
            <DropdownMenuItem className="cursor-pointer" onClick={onSignIn}>
              <LogIn className="w-4" />
              <div>{t("sign.signIn")}</div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {menuItems.map((item) => (
            <DropdownMenuItem key={item.key} onClick={() => setIsOpen(false)}>
              <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center space-x-2">
                {item.icon}
                <div>{item.label}</div>
              </a>
            </DropdownMenuItem>
          ))}

          {user?.email ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={onSignOut}>
                <LogOut className="w-4" />
                <div>{t("sign.signOut")}</div>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AuthDialog open={authOpen} setOpen={setAuthOpen} mode={"login"} />
    </>
  );
};
