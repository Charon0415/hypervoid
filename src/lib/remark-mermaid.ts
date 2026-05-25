/**
 * Remark plugin: ```mermaid code blocks become <MermaidDiagram code="..."/>
 * elements. Pairs with the client component in components/MermaidDiagram.tsx
 * which lazy-loads mermaid.js and renders the SVG.
 */
import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import type { Plugin } from "unified";

type AttrShape = { type: "mdxJsxAttribute"; name: string; value: string };

export const remarkMermaid: Plugin<[], Root> = () => (tree) => {
  visit(tree, "code", (node: Code, index, parent) => {
    if (!parent || typeof index !== "number") return;
    if (node.lang !== "mermaid") return;
    const attrs: AttrShape[] = [
      { type: "mdxJsxAttribute", name: "code", value: node.value },
    ];
    parent.children[index] = {
      type: "mdxJsxFlowElement",
      name: "MermaidDiagram",
      attributes: attrs,
      children: [],
    } as unknown as Root["children"][number];
  });
};
