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

## OUTPUT
- After generating, inform the user: you can paste directly into a BlockNote file with Ctrl+V
`.trim();
