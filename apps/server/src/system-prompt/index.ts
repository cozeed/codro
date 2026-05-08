import { BASE_SYSTEM_PROMPT } from "./en";

export const buildSystemPrompt = (clientSystemPrompt?: string) => {
  if (!clientSystemPrompt) return BASE_SYSTEM_PROMPT;

  return [BASE_SYSTEM_PROMPT, "[USER SYSTEM]", clientSystemPrompt].join("\n\n");
};
