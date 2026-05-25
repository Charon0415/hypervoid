/**
 * Remark plugin: turn standalone YouTube/Bilibili links into responsive
 * iframe embeds. Activates when a paragraph contains exactly one link
 * (or autolink) pointing at a recognised video host — inline mentions of
 * a video URL inside a longer paragraph stay as plain links.
 *
 * Pairs with the <VideoEmbed/> component registered in mdx-components.tsx;
 * the plugin emits an `mdxJsxFlowElement` so React renders a real iframe
 * rather than HTML-as-text inside a <p>, which would warn on hydration.
 */
import { visit } from "unist-util-visit";
import type { Root, Paragraph, Link, Text } from "mdast";
import type { Plugin } from "unified";

type EmbedPart = {
  src: string;
  aspect: string;
  title: string;
};

const YOUTUBE_HOST = /^(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)$/i;
const BILIBILI_HOST = /^(?:www\.)?(?:bilibili\.com|player\.bilibili\.com|b23\.tv)$/i;

function parseEmbed(rawUrl: string): EmbedPart | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (YOUTUBE_HOST.test(url.hostname)) {
    let id = "";
    if (url.hostname.includes("youtu.be")) {
      id = url.pathname.replace(/^\//, "").split("/")[0];
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v") ?? "";
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.slice("/embed/".length).split("/")[0];
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.slice("/shorts/".length).split("/")[0];
    }
    id = id.replace(/[^\w-]/g, "");
    if (!id) return null;
    return {
      src: `https://www.youtube-nocookie.com/embed/${id}`,
      aspect: "16/9",
      title: `YouTube · ${id}`,
    };
  }

  if (BILIBILI_HOST.test(url.hostname)) {
    const m = url.pathname.match(/\/video\/(BV[\w]+)/i);
    let bvid = m?.[1];
    if (!bvid && url.searchParams.get("bvid")) {
      bvid = url.searchParams.get("bvid")!;
    }
    if (!bvid) return null;
    const safeBvid = bvid.replace(/[^\w]/g, "");
    return {
      src: `https://player.bilibili.com/player.html?bvid=${safeBvid}&autoplay=0&high_quality=1`,
      aspect: "16/9",
      title: `Bilibili · ${safeBvid}`,
    };
  }

  return null;
}

type AttrShape = { type: "mdxJsxAttribute"; name: string; value: string };

function buildEmbedNode(embed: EmbedPart) {
  const attrs: AttrShape[] = [
    { type: "mdxJsxAttribute", name: "src", value: embed.src },
    { type: "mdxJsxAttribute", name: "title", value: embed.title },
    { type: "mdxJsxAttribute", name: "aspect", value: embed.aspect },
  ];
  return {
    type: "mdxJsxFlowElement",
    name: "VideoEmbed",
    attributes: attrs,
    children: [],
  };
}

export const remarkVideoEmbed: Plugin<[], Root> = () => (tree) => {
  visit(tree, "paragraph", (node: Paragraph, index, parent) => {
    if (!parent || typeof index !== "number") return;
    if (node.children.length !== 1) return;

    const child = node.children[0];
    let url: string | null = null;
    if (child.type === "link") {
      const link = child as Link;
      if (
        link.children.length === 1 &&
        link.children[0].type === "text" &&
        (link.children[0] as Text).value === link.url
      ) {
        url = link.url;
      } else if (link.children.length === 0) {
        url = link.url;
      } else {
        return; // [name](url) — author chose custom text, leave alone.
      }
    } else if (child.type === "text") {
      const text = (child as Text).value.trim();
      if (/^https?:\/\//.test(text)) url = text;
    }

    if (!url) return;
    const embed = parseEmbed(url);
    if (!embed) return;

    const replacement = buildEmbedNode(embed) as unknown as Root["children"][number];
    parent.children[index] = replacement;
  });
};
