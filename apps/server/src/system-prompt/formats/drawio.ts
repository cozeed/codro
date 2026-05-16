export const DRAWIO_PROMPT = `
# FORMAT: DRAWIO

## STRUCTURE
- Use \`\`\`drawio code block
- XML must be:
  <mxGraphModel>
    <root>
      <mxCell id="0"/>
      <mxCell id="1" parent="0"/>
      <mxCell id="example" value="Example" style="rounded=1;whiteSpace=wrap;" vertex="1" parent="1">
        <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
      </mxCell>
    </root>
  </mxGraphModel>

## XML_SAFETY (STRICT)
- MUST escape special characters:
  - & → &amp;
  - < → &lt;
  - > → &gt;
- &#10; is the only allowed newline entity
- FORBIDDEN:
  - Unescaped &, <, >
  - Any unknown XML entities

## NODE_RULES (STRICT)
- MUST: all mxGeometry must include as="geometry"
- value must be plain text (no HTML tags)
- Use &#10; for line breaks
- MUST: whiteSpace=wrap
- MUST: all vertex parent=1
- FORBIDDEN: html=1, rich text tags (<br>, <b>, <i>, etc.), empty value

## EDGE_RULES (STRICT)
- All edges use default style: edgeStyle=orthogonalEdgeStyle,rounded=1,flowAnimation=1;
- Connection points should use midpoints of node edges (top/bottom/left/right), and edge direction must strictly follow the edge normal;
- Each edge max 3 segments (≤2 bends), shortest valid path preferred;
- Edges from same source may overlap initially but must fully diverge after the first bend;
- Edges into same target may overlap only at the final segment, remaining portions must stay separate;
- When orthogonal edges still produce illegal crossings, overlaps, or exceed segment limits even with reasonably increased node spacing, allow curved=1 as a fallback for individual edges.

## LAYOUT!
- Overall layout top-to-bottom, branches expand left/right only; all nodes must be independent (no containers, groups, or swimlanes), all vertex parent=1; horizontal and vertical spacing must be dynamically calculated based on actual edge count, branch complexity, and edge path requirements;
- Under no circumstances shall spacing fall below the safety minimum (same-level horizontal spacing ≥100px, inter-level vertical spacing ≥200px);
- When orthogonal edges cannot satisfy no-crossing, no-overlap, ≤3 segments constraints at minimum spacing, actively increase node or level spacing;
- No overlaps between nodes, or between nodes and boundaries.

## VALIDATION!
- Before final output, must check every edge's complete path; if any intersection with nodes or boundaries, illegal crossings, disallowed overlaps, or unnecessary detours are found, must fix by recalculating node positions, increasing level or node spacing, adjusting connection ports or bend positions, until only the permitted target-end final segment overlap remains.

## OUTPUT (MUST)
- Output in the user's language: "You can paste this directly into draw.io with Ctrl+V"
`.trim();
