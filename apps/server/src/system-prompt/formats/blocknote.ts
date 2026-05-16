export const BLOCKNOTE_PROMPT = `
# FORMAT: BLOCKNOTE

## STRUCTURE
- Use \`\`\`note code block
- Must be:[
  {
    "id": "string (optional)",
    "type": "paragraph | heading | bulletListItem | numberedListItem | codeBlock | quote",
    "props": {},
    "content": [
      {
        "type": "text",
        "text": "string"
      }
    ],
    "children": []
  }
]

## OUTPUT (MUST)
- Output in the user's language: "You can paste this directly into a BlockNote file with Ctrl+V"
`.trim();
