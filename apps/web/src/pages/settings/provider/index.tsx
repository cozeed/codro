import { useEffect, useRef, useState } from "react";
import { CheckLogin } from "@/pages/check-login";
import { useTranslation } from "react-i18next";
import type { ModelProviderType } from "@/types/model-provider";
import { trpc } from "@workspace/api/client";
import type { ModelProviderItem } from "@workspace/db/schema";
import { useAuth } from "@/hooks/use-auth";
import { Error } from "@/components/error";
import { Spinner } from "@/components/spinner";

import { ProviderConfig } from "./provider-config";
import { ProviderSelector } from "./provider-selector";

export const SettingsProviderPage = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [providerItems, setProviderItems] = useState<ModelProviderItem[]>([]);
  const [curProviderType, setCurProviderType] = useState<ModelProviderType>("openai");
  const [curProviderItem, setCurProviderItem] = useState<ModelProviderItem>();

  const { data, isLoading, error, refetch } = trpc.modelProviders.all.useQuery(undefined, {
    enabled: isLoggedIn, // query only when user is logged in
  });

  const initCalled = useRef(false);

  // init default provider mutation
  const { mutate: initMutate } = trpc.modelProviders.init.useMutation({
    onSuccess() {
      refetch();
    },
    onError(error: unknown) {
      console.error("init default provider failed", error);
    },
  });

  // update local state when data loaded
  useEffect(() => {
    if (!isLoggedIn) return;
    if (data && data.length > 0) {
      const [firstItem] = data;
      queueMicrotask(() => setProviderItems(data));
      queueMicrotask(() => setCurProviderType((c) => c ?? (firstItem!.name as ModelProviderType)));
    }
    // sync missing providers once per mount
    if (data && !initCalled.current) {
      initCalled.current = true;
      initMutate();
    }
  }, [data, isLoggedIn, initMutate]);

  useEffect(() => {
    if (curProviderType && providerItems.length > 0) {
      const found = providerItems.find((p) => p.name === curProviderType);
      if (found) {
        queueMicrotask(() => setCurProviderItem({ ...found }));
      }
    }
  }, [curProviderType, providerItems]);

  if (isLoading) return <Spinner withText />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="h-full w-full">
      <CheckLogin>
        {!isLoggedIn ? (
          <div className="bg-muted/40 text-muted-foreground flex h-full w-full items-center justify-center rounded-lg border border-dashed">
            <p className="text-lg">{t("message.pleaseSignIn")}</p>
          </div>
        ) : (
          <div className="bg-background grid h-full w-full grid-cols-8 overflow-hidden">
            <ProviderSelector
              providerItems={providerItems}
              curProviderType={curProviderType}
              setCurProviderType={setCurProviderType}
            />
            {curProviderItem && <ProviderConfig key={curProviderItem.id} curProviderItem={curProviderItem} />}
          </div>
        )}
      </CheckLogin>
    </div>
  );
};
