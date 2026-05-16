import dagre from "dagre";

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

function normalizeBoardElements(elements: Record<string, unknown>[]) {
  const containerMap = new Map<string, Record<string, unknown>>();
  for (const el of elements) {
    if (el.id) containerMap.set(el.id as string, el);
  }

  const textBindings = new Map<string, { type: string; id: string }[]>();

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
      x: Number(el.x ?? 0),
      y: Number(el.y ?? 0),
      width: Number(el.width ?? 0),
      height: Number(el.height ?? 0),
    };

    if (el.type === "text") {
      const container = containerMap.get(el.containerId as string);
      if (container) {
        const cw = Number(container.width) || 200;
        const ch = Number(container.height) || 60;
        const fs = (el.fontSize as number) || 20;
        const lh = 1.25;
        base.x = Number(container.x) || 0;
        base.y = (Number(container.y) || 0) + (ch - fs * lh) / 2;
        base.width = cw;
        base.height = ch;
        const binding = { type: "text", id: el.id as string };
        textBindings.set(container.id as string, [...(textBindings.get(container.id as string) ?? []), binding]);
      }
      return {
        ...base,
        fontSize: el.fontSize ?? 20,
        fontFamily: el.fontFamily ?? 1,
        text: el.text ?? "",
        textAlign: el.textAlign ?? "center",
        verticalAlign: el.verticalAlign ?? "middle",
        originalText: el.originalText ?? (el.text as string) ?? "",
        autoResize: true,
        lineHeight: 1.25,
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

  // Track arrow→shape bindings so shapes list all arrows that reference them
  const arrowBindings = new Map<string, { type: string; id: string }[]>();
  for (const el of result) {
    const e = el as Record<string, unknown>;
    if (e.type === "arrow") {
      const sb = e.startBinding as { elementId?: string } | null;
      const eb = e.endBinding as { elementId?: string } | null;
      for (const binding of [sb, eb]) {
        if (binding?.elementId) {
          const entry = { type: "arrow", id: e.id as string };
          arrowBindings.set(binding.elementId, [...(arrowBindings.get(binding.elementId) ?? []), entry]);
        }
      }
    }
  }

  for (const el of result) {
    const bindings = [
      ...(textBindings.get((el as Record<string, unknown>).id as string) ?? []),
      ...(arrowBindings.get((el as Record<string, unknown>).id as string) ?? []),
    ];
    if (bindings.length > 0) {
      const existing = ((el as Record<string, unknown>).boundElements as { type: string; id: string }[]) ?? [];
      const existingIds = new Set(existing.map((b: { id: string }) => b.id));
      (el as Record<string, unknown>).boundElements = [...existing, ...bindings.filter((b) => !existingIds.has(b.id))];
    }
  }

  return result;
}

function repositionElements(elements: Record<string, unknown>[]): Record<string, unknown>[] {
  const shapeMap = new Map<string, Record<string, unknown>>();
  const arrowList: Record<string, unknown>[] = [];
  const standaloneTexts: Record<string, unknown>[] = [];

  for (const el of elements) {
    if (el.type === "arrow") {
      arrowList.push(el);
    } else if (el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond") {
      shapeMap.set(el.id as string, el);
    } else if (el.type === "text" && !el.containerId) {
      standaloneTexts.push(el);
    }
  }

  // Match standalone texts to nearest arrow and bind via containerId
  if (standaloneTexts.length > 0) {
    const shapeCenterMap = new Map<string, { cx: number; cy: number }>();
    for (const [id, shape] of shapeMap) {
      shapeCenterMap.set(id, {
        cx: Number(shape.x) + Number(shape.width) / 2,
        cy: Number(shape.y) + Number(shape.height) / 2,
      });
    }

    for (const text of standaloneTexts) {
      const tx = Number(text.x) + Number(text.width || 40) / 2;
      const ty = Number(text.y) + Number(text.height || 20) / 2;
      let bestArrow: Record<string, unknown> | null = null;
      let bestDist = Infinity;

      for (const arrow of arrowList) {
        const sb = arrow.startBinding as { elementId?: string } | null;
        const eb = arrow.endBinding as { elementId?: string } | null;
        if (!sb?.elementId || !eb?.elementId) continue;
        const sc = shapeCenterMap.get(sb.elementId);
        const tc = shapeCenterMap.get(eb.elementId);
        if (!sc || !tc) continue;
        const dist = Math.hypot((sc.cx + tc.cx) / 2 - tx, (sc.cy + tc.cy) / 2 - ty);
        if (dist < bestDist) {
          bestDist = dist;
          bestArrow = arrow;
        }
      }

      if (bestArrow) {
        text.containerId = bestArrow.id as string;
        const arrowEl = bestArrow;
        const existing = (arrowEl.boundElements as { type: string; id: string }[]) ?? [];
        if (!existing.some((b) => b.id === text.id)) {
          arrowEl.boundElements = [...existing, { type: "text", id: text.id as string }];
        }
      }
    }
  }

  // Flowchart detection: arrows with valid bindings to shapes
  const edges: { arrow: Record<string, unknown>; from: string; to: string }[] = [];
  const connectedShapes = new Set<string>();

  for (const arrow of arrowList) {
    const sb = arrow.startBinding as { elementId?: string } | null;
    const eb = arrow.endBinding as { elementId?: string } | null;
    const startId = sb?.elementId;
    const endId = eb?.elementId;
    if (startId && endId && shapeMap.has(startId) && shapeMap.has(endId)) {
      edges.push({ arrow, from: startId, to: endId });
      connectedShapes.add(startId);
      connectedShapes.add(endId);
    }
  }

  // No valid arrow bindings → not a flowchart
  if (edges.length === 0) return elements;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 80, edgesep: 60, ranksep: 100, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const id of connectedShapes) {
    const shape = shapeMap.get(id)!;
    g.setNode(id, { width: Number(shape.width) || 200, height: Number(shape.height) || 60 });
  }

  for (const { from, to } of edges) {
    g.setEdge(from, to);
  }

  dagre.layout(g);

  // Apply new positions to shapes
  for (const id of connectedShapes) {
    const node = g.node(id);
    const shape = shapeMap.get(id)!;
    shape.x = node.x - node.width / 2;
    shape.y = node.y - node.height / 2;
  }

  // Sync text elements bound to moved shapes
  for (const el of elements) {
    if (el.type === "text" && el.containerId) {
      const container = shapeMap.get(el.containerId as string);
      if (container && connectedShapes.has(el.containerId as string)) {
        const cw = Number(container.width) || 200;
        const ch = Number(container.height) || 60;
        const fs = (el.fontSize as number) || 20;
        const lh = 1.25;
        el.x = Number(container.x) || 0;
        el.y = (Number(container.y) || 0) + (ch - fs * lh) / 2;
        el.width = cw;
        el.height = ch;
      }
    }
  }

  // Update arrow positions based on moved shapes
  for (const { arrow, from, to } of edges) {
    const fromShape = shapeMap.get(from)!;
    const toShape = shapeMap.get(to)!;
    const fx = Number(fromShape.x) + Number(fromShape.width) / 2;
    const fy = Number(fromShape.y) + Number(fromShape.height);
    const tx = Number(toShape.x) + Number(toShape.width) / 2;
    const ty = Number(toShape.y);

    arrow.x = fx;
    arrow.y = fy;
    arrow.points = [[0, 0], [tx - fx, ty - fy]];
  }

  return elements;
}

export interface ProcessedBoard {
  elements: Record<string, unknown>[];
  files: Record<string, unknown>;
  appState: Record<string, unknown>;
}

export function processBoardCode(code: string): ProcessedBoard | null {
  try {
    const data = JSON.parse(code);
    const rawElements: Record<string, unknown>[] = Array.isArray(data.elements)
      ? data.elements
      : Array.isArray(data)
        ? data
        : null;
    if (!rawElements || rawElements.length === 0) return null;

    const elements = repositionElements(normalizeBoardElements(rawElements));

    return {
      elements,
      files: (data.files || {}) as Record<string, unknown>,
      appState: (data.appState || {}) as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
