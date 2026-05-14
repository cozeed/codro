import { BASE_PROMPT } from "./base";
import { MERMAID_PROMPT } from "./formats/mermaid";
import { EXCALIDRAW_PROMPT } from "./formats/excalidraw";
import { TLDRAW_PROMPT } from "./formats/tldraw";
import { DRAWIO_PROMPT } from "./formats/drawio";
import { MINDMAP_PROMPT } from "./formats/mindmap";
import { BLOCKNOTE_PROMPT } from "./formats/blocknote";

type Format = "mermaid" | "excalidraw" | "tldraw" | "drawio" | "mindmap" | "blocknote";

const FORMAT_KEYWORDS: Record<Format, RegExp[]> = {
  mermaid: [/mermaid/i, /流程图|时序图|类图|状态图|饼图|甘特图|er图/],
  excalidraw: [/excalidraw|board/i, /流程图|时序图|类图|状态图|饼图|甘特图|er图|架构图|白板/],
  tldraw: [/tldraw/i, /流程图|时序图|类图|状态图|饼图|甘特图|er图|架构图|白板/],
  drawio: [/drawio/i, /流程图|架构图|网络拓扑图|组织结构图|部署图|泳道图|关系图/],
  blocknote: [/blocknote/i, /笔记|文档/],
  mindmap: [/mindmap|mind\s*map/i, /思维导图|心智图/],
};

const FORMAT_PROMPTS: Record<Format, string> = {
  mermaid: MERMAID_PROMPT,
  excalidraw: EXCALIDRAW_PROMPT,
  tldraw: TLDRAW_PROMPT,
  drawio: DRAWIO_PROMPT,
  mindmap: MINDMAP_PROMPT,
  blocknote: BLOCKNOTE_PROMPT,
};

function detectFormats(userMessage: unknown): Format[] {
  // Normalize content: handle both string and array-of-parts formats
  const text =
    typeof userMessage === "string"
      ? userMessage
      : Array.isArray(userMessage)
        ? userMessage.map((p: { text?: string; type?: string }) => p.text ?? "").join(" ")
        : String(userMessage ?? "");

  const lower = text.toLowerCase();
  const matched = new Set<Format>();

  for (const [format, patterns] of Object.entries(FORMAT_KEYWORDS)) {
    for (const pattern of patterns) {
      if (pattern.test(lower) || pattern.test(text)) {
        matched.add(format as Format);
        break;
      }
    }
  }

  // Default to mermaid if nothing matched
  return matched.size > 0 ? Array.from(matched) : ["mermaid"];
}

export const buildSystemPrompt = (clientSystemPrompt?: string, userMessage?: string) => {
  const formats = userMessage ? detectFormats(userMessage) : ["mermaid"];

  const formatSections = formats.map((f) => FORMAT_PROMPTS[f as Format]).join("\n\n---\n\n");
  const prompt = `${BASE_PROMPT}\n\n---\n\n${formatSections}`;

  if (!clientSystemPrompt) return prompt;

  return [prompt, "[USER SYSTEM]", clientSystemPrompt].join("\n\n");
};
