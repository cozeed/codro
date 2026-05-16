export const TLDRAW_PROMPT = `
# FORMAT: TLDRAW

## STRUCTURE
- Use \`\`\`board code block
- Root structure: {"type":"excalidraw/clipboard","elements":[],"files":{}}
- MUST output only essential fields; omit all default-value properties (angle, opacity, fillStyle, strokeStyle, roughness, groupIds, version, versionNonce, isDeleted, updated, link, locked, originalText are auto-filled by the frontend)

## MINIMAL FIELDS

Shape (rectangle/ellipse/diamond):
{"id":"N1","type":"rectangle","x":200,"y":100,"width":240,"height":70,"strokeColor":"#22d3ee","backgroundColor":"#08334466","boundElements":[{"type":"text","id":"T1"},{"type":"arrow","id":"A1"}]}

Text (type:text, bound to a shape):
{"id":"T1","type":"text","x":210,"y":105,"width":220,"height":60,"fontSize":18,"strokeColor":"#f8fafc","text":"Node name","containerId":"N1"}

Arrow (type:arrow, connecting two shapes):
{"id":"A1","type":"arrow","x":520,"y":120,"width":0,"height":200,"strokeColor":"#94a3b8","points":[[0,0],[0,200]],"startBinding":{"elementId":"N1","gap":1},"endBinding":{"elementId":"N2","gap":1},"endArrowhead":"arrow"}

## LAYOUT
- direction: top_to_bottom
- node_width_min: 200
- vertical_spacing_min: 300
- horizontal_spacing_min: 300

## MUST
- Nodes must not overlap
- All bindings must be valid

## OUTPUT (MUST)
- Output in the user's language: "You can paste this directly into a tldraw file with Ctrl+V"
`.trim();
