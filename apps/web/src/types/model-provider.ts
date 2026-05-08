import type { ElementType } from "react";
import { Icons } from "@/components/icons";

// Provider type
export type ModelProviderType = "openai" | "deepseek" | "anthropic" | "google" | "openrouter";

// Provider info
export interface ModelProviderInfo {
  name: string;
  icon: ElementType;
}

export const modelProviders: Record<ModelProviderType, ModelProviderInfo> = {
  openai: {
    name: "OpenAI",
    icon: Icons.openai,
  },
  anthropic: {
    name: "Anthropic",
    icon: Icons.anthropic,
  },
  google: {
    name: "Google",
    icon: Icons.google,
  },
  deepseek: {
    name: "DeepSeek",
    icon: Icons.deepseek,
  },
  openrouter: {
    name: "OpenRouter",
    icon: Icons.openrouter,
  },
};
