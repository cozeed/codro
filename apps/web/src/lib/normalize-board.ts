const defaults = {
  angle: 0,
  fillStyle: "solid",
  strokeWidth: 2,
  strokeStyle: "solid",
  roughness: 1,
  opacity: 100,
  groupIds: [] as string[],
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
};

export function normalizeBoardElements(elements: Record<string, unknown>[]) {
  const containerMap = new Map<string, Record<string, unknown>>();
  for (const el of elements) {
    if (el.id) containerMap.set(el.id as string, el);
  }

  const result = elements.map((el) => {
    const seed = el.seed ?? Math.floor(Math.random() * 100000);
    const base: Record<string, unknown> = {
      ...defaults,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      seed,
      version: 1,
      versionNonce: seed,
      ...el,
    };

    if (el.type === "text") {
      const container = containerMap.get(el.containerId as string);
      if (container) {
        base.x = container.x;
        base.y = container.y;
        base.width = container.width;
        base.height = container.height;
      }
      return {
        ...base,
        fontSize: el.fontSize ?? 20,
        fontFamily: el.fontFamily ?? 1,
        text: el.text ?? "",
        textAlign: el.textAlign ?? "center",
        verticalAlign: el.verticalAlign ?? "middle",
        originalText: el.originalText ?? (el.text as string) ?? "",
        roundness: null,
      };
    } else if (el.type === "arrow") {
      return {
        ...base,
        startBinding: el.startBinding ?? null,
        endBinding: el.endBinding ?? null,
        startArrowhead: el.startArrowhead ?? null,
        endArrowhead: el.endArrowhead ?? "arrow",
      };
    }

    return {
      ...base,
      roundness: el.roundness ?? { type: 2 },
    };
  });

  return result;
}

export function normalizeBoardJson(code: string): string | null {
  try {
    const data = JSON.parse(code);
    if (!Array.isArray(data.elements)) return null;

    const elements = normalizeBoardElements(data.elements);

    return JSON.stringify({
      type: "excalidraw/clipboard",
      elements,
      files: data.files || {},
      appState: data.appState || {},
    });
  } catch {
    return null;
  }
}
