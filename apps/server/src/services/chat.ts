import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import type { Context } from "hono";
import { ModelProviderService } from "@workspace/api/server";
import type { ModelProviderItem } from "@workspace/db/schema";

import { searchWebTool } from "../lib/search-tool";
import { buildSystemPrompt } from "../system-prompt/index";

// normalize baseURL by provider type, for example, google gemini must end with /v1beta, while others must end with /v1
const normalizeBaseURL = (baseURL: string, provider: string) => {
  if (!baseURL) return "";
  const clean = baseURL.replace(/\/v\d+[a-z]*\/?$/, "");

  switch (provider) {
    case "google":
      return `${clean}/v1beta`;
    case "openai":
    case "deepseek":
    case "anthropic":
    case "openrouter":
      return `${clean}/v1`;
    default:
      return clean;
  }
};

export const handleChatStream = async (c: Context) => {
  try {
    const { messages, system: clientSystemPrompt, tools, model } = await c.req.json();
    // get model provider item by model name(gpt-4)
    const db = c.get("db");
    const user = c.get("user");
    if (!db) {
      return c.json({ code: 500, message: "db not initialized", data: null }, 500);
    }
    if (!user) {
      return c.json({ code: 401, message: "user not logged in", data: null }, 401);
    }
    //
    const svc = new ModelProviderService(db, user.id);
    const providerItem: ModelProviderItem | null = await svc.getByModelName(model);
    if (!providerItem) {
      return c.json({ code: 404, message: `model ${model} provider not found`, data: null }, 404);
    }
    providerItem.models = model;

    const lastUserMessage = messages?.filter((m: { role: string }) => m.role === "user").pop()?.parts;
    const systemPrompt = buildSystemPrompt(clientSystemPrompt, lastUserMessage);

    const modelMessages = await convertToModelMessages(messages);
    // stream text from language model
    const result = streamText({
      model: getLanguageModel(providerItem),
      messages: modelMessages,
      system: systemPrompt,
      tools: {
        ...frontendTools(tools ?? {}),
        search: searchWebTool,
      },
      maxOutputTokens: 16384,
      stopWhen: stepCountIs(10),
      onError: console.error,
    });

    const response = result.toUIMessageStreamResponse();

    return response;
  } catch (error) {
    return c.json({ code: 500, message: error instanceof Error ? error.message : "Unknown error", data: null }, 500);
  }
};
// get language model from model provider item
const getLanguageModel = (providerItem: ModelProviderItem) => {
  const { name: providerName, apiKey, baseUrl, models: modelName } = providerItem;
  if (!apiKey || !modelName) {
    throw new Error(`missing required fields: apiKey or models`);
  }
  const baseURL = normalizeBaseURL(baseUrl, providerName);
  switch (providerName) {
    case "openai":
      return createOpenAI({ apiKey, baseURL })(modelName);
    case "anthropic":
      return createAnthropic({ apiKey, baseURL })(modelName);
    case "google":
      return createGoogleGenerativeAI({ apiKey, baseURL })(modelName);
    case "deepseek":
      return createDeepSeek({ apiKey, baseURL })(modelName);
    case "openrouter":
      return createOpenAI({ apiKey, baseURL })(modelName);
    default:
      throw new Error(`unsupported provider type ${providerName}`);
  }
};
