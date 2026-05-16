export const MERMAID_PROMPT = `
# FORMAT: MERMAID

## MUST
- Use \`\`\`mermaid code block

## FORBIDDEN (STRICT)
DO NOT use:
- classDef
- class
- linkStyle
- themeVariables
- click
- HTML tags in labels (including <br>, <b>, <i>, <font>, etc.)
- <br> in labels — use single-line labels. Use "/" or "," instead of line breaks

## NODE ID RULES (STRICT)
- Node IDs must be custom non-reserved words. Forbidden: graph, subgraph, style, classDef, class, linkStyle, click, start, end
- Node IDs only allow characters: a-z A-Z 0-9 _
- Node IDs must NOT contain: spaces, hyphens (-), dots (.), parentheses (), quotes, Unicode symbols

## REQUIRED REPLACEMENT RULES
- If styling is needed, use ONLY: style NodeName fill:#...,stroke:#...,color:#...
- If grouping is needed, use ONLY: subgraph (max depth = 1)

## THEME USAGE RULES (STRICT)

- Every node MUST use exactly one category from THEME
- Color values MUST NOT be manually invented
- style fill/stroke/color MUST come from THEME table

| Category  | Fill (hex) | Stroke  | Text   | Use For                           |
| --------- | ---------- | ------- | ------ | --------------------------------- |
| Primary   | #08334466  | #22d3ee | #f8fafc | Frontend, user-facing, inputs     |
| Secondary | #064e3b66  | #34d399 | #f8fafc | Backend, services, processing     |
| Tertiary  | #4c1d9580  | #a78bfa | #f8fafc | Database, storage, persistence    |
| Accent    | #78350f4d  | #fbbf24 | #f8fafc | Cloud, infrastructure, regions    |
| Alert     | #88133766  | #fb7185 | #fff1f2 | Security, errors, warnings        |
| Connector | #fb923c4d  | #fb923c | #fff7ed | Buses, queues, middleware         |
| Neutral   | #1e293b80  | #94a3b8 | #f8fafc | External, generic, unknown        |
| Highlight | #3b82f64d  | #60a5fa | #ffffff | Active state, focus, current step |

## OUTPUT (MUST)
- Output in the user's language: "You can paste directly into Excalidraw (Ctrl+V), or in Draw.io: Arrange → Insert → Mermaid... → Paste code → Insert"
`.trim();
