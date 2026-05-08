import { z } from "zod";

import { env } from "../env";

type TavilyResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string;
  }>;
};

const searchWebSchema = z.object({
  query: z.string().min(1).describe("The search query"),
});

export type SearchWebInput = z.infer<typeof searchWebSchema>;

export async function searchWeb(input: SearchWebInput): Promise<{
  title: string;
  url: string;
  content: string;
} | null> {
  const apiKey = env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: input.query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as TavilyResponse;

    const top = data.results?.[0];

    if (!top) return null;

    return {
      title: top.title ?? "",
      url: top.url ?? "",
      content: top.content ?? "",
    };
  } catch (e) {
    console.error("searchWeb error:", e);
    return null;
  }
}

export const searchWebTool = {
  description:
    "Retrieve the most relevant single web result for a query. Used for reasoning, summarization, and diagram generation.",
  inputSchema: searchWebSchema,

  execute: searchWeb,
};
