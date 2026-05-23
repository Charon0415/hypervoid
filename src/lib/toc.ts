import GithubSlugger from "github-slugger";

export type TOCItem = {
  depth: number;
  text: string;
  id: string;
};

export function extractTOC(content: string, maxDepth = 3): TOCItem[] {
  const slugger = new GithubSlugger();
  const lines = content.split("\n");
  const items: TOCItem[] = [];
  let inFence = false;

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (line.startsWith("```") || line.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (!m) continue;
    const depth = m[1].length;
    if (depth > maxDepth + 1) continue;

    const text = m[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    const id = slugger.slug(text);
    items.push({ depth, text, id });
  }
  return items;
}
