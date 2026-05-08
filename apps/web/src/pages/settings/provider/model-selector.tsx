"use client";

import { useEffect, useState } from "react";
import { modelProviders, type ModelProviderType } from "@/types/model-provider";
import { trpc } from "@workspace/api/client";
import type { ModelProviderItem } from "@workspace/db/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  currentModel: string;
  setCurrentModel: (model: string) => void;
}

export const ModelSelector = ({ currentModel, setCurrentModel }: Props) => {
  const { isLoggedIn } = useAuth();
  const [providerItems, setProviderItems] = useState<ModelProviderItem[]>([]);

  const { data } = trpc.modelProviders.all.useQuery(undefined, {
    enabled: isLoggedIn, // only fetch when user is logged in
  });
  const getAvailableModels = (providerItems: ModelProviderItem[]): ModelProviderItem[] => {
    return providerItems
      .filter((p) => p.apiKey) // filter out providers with null apiKey
      .flatMap((p) => {
        const modelList = p.models
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);

        return modelList.map((model) => ({
          ...p,
          models: model, // only keep one model per provider
        }));
      });
  };
  useEffect(() => {
    if (!isLoggedIn) return;
    if (data && data.length > 0) {
      // Filter available models for current user
      queueMicrotask(() => setProviderItems(getAvailableModels(data)));
    }
    //
  }, [data, isLoggedIn]);
  useEffect(() => {
    if (providerItems.length > 0 && !currentModel) {
      setCurrentModel(providerItems[0]!.models);
    }
  }, [providerItems, currentModel, setCurrentModel]);

  return (
    <Select value={currentModel} onValueChange={setCurrentModel}>
      <SelectTrigger size="sm" className="w-full min-w-0 data-[size=sm]:h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {providerItems.map((providerItem) => {
          const model = providerItem.models;
          const Icon = modelProviders[providerItem.name as ModelProviderType]?.icon;
          return (
            <SelectItem key={model} value={model}>
              <span className="flex items-center gap-2">
                {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
                <span>{model}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
