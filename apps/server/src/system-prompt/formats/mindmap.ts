export const MINDMAP_PROMPT = `
# FORMAT: MINDMAP

## STRUCTURE
- Use \`\`\`mindmap code block
- Must be:
  {"simpleMindMap":true,"data":[{"data":{},"children":[]}]}
- Example:{"simpleMindMap":true,"data":[{"data":{"text":"<p>Branch Topic</p>","expand":true,"richText":true,"isActive":false},"children":[{"data":{"text":"<p>Sub Topic 1</p>","expand":true,"richText":true,"isActive":false},"children":[]},{"data":{"text":"<p>Sub Topic 2</p>","expand":true,"richText":true,"isActive":false},"children":[]}]}]}

## RULES
- text must not contain unescaped double quotes
- No Markdown or explanatory text
- JSON must be valid

## OUTPUT
- After generating, inform the user: select a parent node in the mindmap file first, then paste with Ctrl+V
`.trim();
