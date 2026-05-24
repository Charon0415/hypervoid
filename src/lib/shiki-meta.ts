import type { ShikiTransformer } from "shiki";

export const transformerCodeMeta: ShikiTransformer = {
  name: "code-meta",
  pre(node) {
    if (!node.properties) node.properties = {};

    const lang = this.options.lang;
    if (lang && lang !== "plaintext" && lang !== "text" && lang !== "ansi") {
      node.properties["data-language"] = lang;
    }

    const rawMeta = this.options.meta?.__raw;
    if (rawMeta) {
      const m = rawMeta.match(/(?:filename|title)=(?:"([^"]+)"|'([^']+)')/);
      if (m) {
        node.properties["data-filename"] = m[1] ?? m[2];
      }
    }
  },
};
