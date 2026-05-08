import { useEffect, useRef, useState } from "react";
import { authClient } from "@/clients/auth-client";
import { deleteFile, getFileUrl, uploadFile } from "@/services/storage-service";
import { Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { useAuth } from "@/hooks/use-auth";
import { CustomAvatar } from "@/components/custom-avatar";
import { Spinner } from "@/components/spinner";

import { SettingItem } from "../components/setting-item";

export const AccountAvatar = () => {
  const { t } = useTranslation();
  const { user, session } = useAuth();
  const filePath = user?.image ?? "";
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    if (!filePath) return;
    let cancelled = false;
    (async () => {
      const result = await getFileUrl(filePath);
      if (!cancelled) setFileUrl(result.data.fileUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  const resolvedFileUrl = filePath ? fileUrl : "";

  const isUrl = (url: string) => {
    return /^https?:\/\//.test(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    const token = session?.token;
    if (!token) return;
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error(`File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }
    setIsUploading(true);

    try {
      const type = "avatars";
      const result = await uploadFile(file, type);
      await authClient.updateUser({ image: result.data.filePath });
      if (filePath && !isUrl(filePath)) {
        await deleteFile(filePath, token);
      }

      toast.success(t("settings.uploadPictureSuccess"));
    } catch (error) {
      toast.error(`${t("settings.uploadPictureFail")}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    const token = session?.token;
    if (!token) {
      return;
    }
    setIsRemoving(true);
    try {
      if (filePath && !isUrl(filePath)) {
        await deleteFile(filePath, token);
      }
      await authClient.updateUser({ image: "" });
      toast.success(t("settings.removePictureSuccess"));
    } catch (error) {
      toast.error(`${t("settings.removePictureFail")}: ${error}`);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-2">
      <SettingItem title={t("settings.picture")} className="mb-1" />
      <div className="flex items-center gap-4">
        <CustomAvatar image={resolvedFileUrl} name={user?.name} size="lg" className="bg-blue-400 text-white" />

        {/* Upload button */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file);
                e.target.value = "";
              }
            }}
          />
          {/* Upload button */}
          <Button variant="outline" size="sm" disabled={isUploading} onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? <Spinner className="h-4 w-4 border-3" /> : t("settings.uploadPicture")}
          </Button>

          {/* Remove button */}
          <Button variant="outline" size="sm" onClick={handleRemove} disabled={!filePath || isRemoving}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isRemoving ? <Spinner className="h-4 w-4 border-3" /> : t("settings.removePicture")}
          </Button>
        </div>
      </div>

      {/* File format hint */}
      <p className="text-muted-foreground text-xs">{t("settings.uploadPictureDescription")}</p>
      <Separator className="my-3" />
    </div>
  );
};
