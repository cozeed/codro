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

  return result;
}

interface RawBoardElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  containerId?: string;
  startBinding?: { elementId: string; gap?: number };
  endBinding?: { elementId: string; gap?: number };
  boundElements?: { type: string; id: string }[];
  [key: string]: unknown;
}

function repositionElements(rawElements: RawBoardElement[]): RawBoardElement[] | null {
  if (rawElements.length === 0) return null;

  const elements = rawElements.map((e) => ({ ...e }));

  const texts = elements.filter((e) => e.type === "text");
  const arrows = elements.filter((e) => e.type === "arrow");
  const shapes = elements.filter((e) => e.type !== "text" && e.type !== "arrow");

  if (shapes.length === 0) return null;

  // Only reposition standard flowchart shapes (sequence diagrams have line/freedraw/etc.)
  const FLOWCHART_TYPES = new Set(["rectangle", "diamond", "ellipse"]);
  if (shapes.some((s) => !FLOWCHART_TYPES.has(s.type))) return elements;

  // Match standalone texts to nearest arrow by endpoint midpoint
  const shapeCenterMap = new Map<string, { cx: number; cy: number }>();
  for (const shape of shapes) {
    shapeCenterMap.set(shape.id, {
      cx: shape.x + (shape.width || 200) / 2,
      cy: shape.y + (shape.height || 60) / 2,
    });
  }

  const SNAP_RADIUS = 200;
  const textArrowMap = new Map<string, string>();

  for (const text of texts) {
    if (text.containerId) continue;
    const tx = text.x + (text.width || 40) / 2;
    const ty = text.y + (text.height || 20) / 2;

    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const arrow of arrows) {
      const from = arrow.startBinding?.elementId;
      const to = arrow.endBinding?.elementId;
      if (!from || !to) continue;
      const sc = shapeCenterMap.get(from);
      const tc = shapeCenterMap.get(to);
      if (!sc || !tc) continue;
      const mx = (sc.cx + tc.cx) / 2;
      const my = (sc.cy + tc.cy) / 2;
      const dist = Math.hypot(mx - tx, my - ty);
      if (dist < bestDist && dist < SNAP_RADIUS) {
        bestDist = dist;
        bestId = arrow.id;
      }
    }

    if (bestId) textArrowMap.set(text.id, bestId);
  }

  // Build dagre graph: shapes as nodes, arrows as edges
  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 80, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const shape of shapes) {
    g.setNode(shape.id, { width: shape.width || 200, height: shape.height || 60 });
  }

  for (const arrow of arrows) {
    const from = arrow.startBinding?.elementId;
    const to = arrow.endBinding?.elementId;
    if (from && to) g.setEdge(from, to, {}, arrow.id);
  }

  dagre.layout(g);

  // Reposition shapes
  const posMap = new Map<string, { x: number; y: number }>();
  for (const shape of shapes) {
    const pos = g.node(shape.id);
    if (!pos) continue;
    const w = shape.width || 200;
    const h = shape.height || 60;
    shape.x = pos.x - w / 2;
    shape.y = pos.y - h / 2;
    posMap.set(shape.id, { x: shape.x, y: shape.y });
  }

  // Reposition container texts — center vertically by estimated natural height
  for (const text of texts) {
    if (!text.containerId || !posMap.has(text.containerId)) continue;
    const shape = shapes.find((s) => s.id === text.containerId);
    if (!shape) continue;
    const sh = shape.height || 60;
    const fontSize = (text.fontSize as number) || 20;
    const lineHeight = (text.lineHeight as number) || 1.25;
    text.x = shape.x;
    text.y = shape.y + (sh - fontSize * lineHeight) / 2;
    text.width = shape.width || 200;
    text.height = sh;
  }

  // Reposition arrows & place matched texts at arrow path midpoint
  for (const arrow of arrows) {
    const from = arrow.startBinding?.elementId;
    const to = arrow.endBinding?.elementId;
    if (!from || !to) continue;
    const edgeObj = g.edge(from, to, arrow.id) as { points?: { x: number; y: number }[] } | undefined;
    if (edgeObj?.points && edgeObj.points.length >= 2) {
      const pts = edgeObj.points;
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      arrow.x = minX;
      arrow.y = minY;
      arrow.width = Math.max(1, maxX - minX);
      arrow.height = Math.max(1, maxY - minY);
      arrow.points = pts.map((p) => [p.x - minX, p.y - minY]);

      // Position matched text at the midpoint of this arrow's path
      for (const [textId, arrowId] of textArrowMap) {
        if (arrowId !== arrow.id) continue;
        const text = texts.find((t) => t.id === textId);
        if (!text) continue;
        const midPt = pts[Math.floor(pts.length / 2)];
        if (!midPt) continue;
        const tw = text.width || 40;
        const th = text.height || 20;
        text.x = midPt.x - tw / 2;
        text.y = midPt.y - th / 2;
      }
    }
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

    const normalized = normalizeBoardElements(
      rawElements as unknown as Record<string, unknown>[],
    ) as unknown as RawBoardElement[];
    const repositioned = repositionElements(normalized);
    const elements = (repositioned as unknown as Record<string, unknown>[]) ?? normalized;

    return {
      elements,
      files: (data.files || {}) as Record<string, unknown>,
      appState: (data.appState || {}) as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
