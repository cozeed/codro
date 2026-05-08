import { eq } from "drizzle-orm";

import type { DatabaseInstance } from "./client";
import { modelProviderTable } from "./schemas/model-provider";

const DEFAULT_PROVIDERS = [
  {
    name: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    models: "gpt-5.4,gpt-5.4-mini",
    sort: 0,
  },
  {
    name: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    apiKey: "",
    models: "claude-sonnet-4.6,claude-opus-4.6",
    sort: 1,
  },
  {
    name: "google",
    baseUrl: "https://generativelanguage.googleapis.com",
    apiKey: "",
    models: "gemini-2.5-pro,gemini-2.5-flash",
    sort: 2,
  },
  {
    name: "deepseek",
    baseUrl: "https://api.deepseek.com",
    apiKey: "",
    models: "deepseek-chat,deepseek-reasoner",
    sort: 3,
  },
  {
    name: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey: "",
    models:
      "openai/gpt-5.4,anthropic/claude-sonnet-4.6,google/gemini-2.5-pro,deepseek/deepseek-chat,meta-llama/llama-4-maverick",
    sort: 4,
  },
];

export const initModelProviders = async (db: DatabaseInstance, userId: string) => {
  const existing = await db
    .select({ name: modelProviderTable.name })
    .from(modelProviderTable)
    .where(eq(modelProviderTable.createdBy, userId));
  const existingNames = new Set(existing.map((r) => r.name));

  const missing = DEFAULT_PROVIDERS.filter((p) => !existingNames.has(p.name)).map((p) => ({ ...p, createdBy: userId }));

  if (missing.length > 0) {
    await db.insert(modelProviderTable).values(missing);
  }
};
