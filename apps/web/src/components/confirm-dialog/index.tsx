import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

interface Props {
  open: boolean;
  onOpenChange?: (open: boolean) => void; // Controls dialog visibility
  onOk?: () => void | Promise<void>; // Confirm button callback
  onCancel?: () => void; // Cancel button callback
  title: string; // Dialog title
  description: string; // Dialog description
  confirmText?: string; // Confirm button text
  cancelText?: string; // Cancel button text
  isLoading?: boolean; // Loading state
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  onOk,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
}: Props) => {
  const { t } = useTranslation();
  const okBtnText = confirmText ?? t("confirm.ok");
  const cancelBtnText = cancelText ?? t("confirm.cancel");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 sm:max-w-[425px]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onCancel?.();
        }}
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="">{title}</DialogTitle>
          <DialogDescription className="font-bold">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="">
          <Button
            variant="outline"
            onClick={onOk}
            className="h-8 w-20 bg-blue-500 text-white hover:bg-blue-700 hover:text-white focus-visible:bg-blue-700 focus-visible:ring-1 focus-visible:ring-offset-1"
            disabled={isLoading}
          >
            {isLoading ? t("message.loading") : okBtnText}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="mr-2 h-8 w-20 focus-visible:ring-1 focus-visible:ring-offset-1"
          >
            {cancelBtnText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
