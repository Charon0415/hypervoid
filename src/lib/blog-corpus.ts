import "server-only";

import { README_TEXT, HANDBOOK_TEXT } from "./blog-corpus-text";

/**
 * Reads README.md and docs/handbook.md as build-time constants generated
 * by scripts/build-blog-corpus.ts so Kanna's chat persona stays in sync
 * with whatever the current docs say — updating the docs and re-running
 * `pnpm dev`/`pnpm build` updates her knowledge automatically.
 *
 * Earlier this was an fs.readFileSync at module init with
 * outputFileTracingIncludes, but that tripped Vercel's symlinked-files
 * deployment check under pnpm. Inlining as JSON-quoted strings sidesteps
 * the issue entirely while preserving the "edit docs, restart, Kanna
 * sees the change" workflow.
 */

let _cached: string | null = null;

/** Headings only — a TOC the model can use to know what chapters exist. */
function extractHandbookToc(handbook: string): string {
  return handbook
    .split("\n")
    .filter((line) => /^#{2,3}\s+/.test(line))
    .slice(0, 80)
    .join("\n");
}

/**
 * Chapters most relevant to a user-facing assistant: project overview,
 * content creation, site customization. Dev/ops chapters (deployment,
 * troubleshooting) are skipped — the visitor doesn't ask Kanna those.
 */
function extractRelevantChapters(handbook: string): string {
  const wanted = ["## 一、项目概览", "## 三、内容创作", "## 四、站点定制"];
  const out: string[] = [];
  for (let i = 0; i < wanted.length; i++) {
    const start = handbook.indexOf(wanted[i]);
    if (start < 0) continue;
    const nextHeading = handbook
      .slice(start + wanted[i].length)
      .search(/\n## [^#]/);
    const end =
      nextHeading < 0 ? handbook.length : start + wanted[i].length + nextHeading;
    out.push(handbook.slice(start, end).trim());
  }
  return out.join("\n\n");
}

export function getBlogCorpus(): string {
  if (_cached !== null) return _cached;

  const sections: string[] = [];

  if (README_TEXT) {
    sections.push("=== README.md (站点说明 + 路由表 + 功能清单) ===");
    sections.push(README_TEXT);
  }

  if (HANDBOOK_TEXT) {
    sections.push("\n=== 手册章节索引 ===");
    sections.push(extractHandbookToc(HANDBOOK_TEXT));
    sections.push("\n=== 手册相关章节 ===");
    sections.push(extractRelevantChapters(HANDBOOK_TEXT));
  }

  _cached = sections.join("\n").slice(0, 24_000);
  return _cached;
}

/**
 * A short, hand-curated routes table — fallback if doc files are missing
 * or trimmed. Mirrors the README site map but stays small.
 */
export const ROUTE_REFERENCE = `# 站点主要路由
- /                 首页(最新文章 + 侧边栏)
- /posts            所有文章
- /posts/[slug]     文章详情(含 AI Q&A、评论、目录、分享)
- /tags             所有标签
- /tags/[tag]       某个标签下的文章
- /search           全文搜索(?q + ?tag + ?year)
- /archive          按年月归档
- /series           文章系列索引
- /anime /movies /books   Bangumi 同步的追番 / 影视 / 书籍
- /games            Steam 游戏库
- /albums           相册
- /diary            日记
- /projects /skills /timeline   个人页
- /friends          友链 + 申请友链
- /guestbook        留言板(GitHub OAuth 登录)
- /resources        资源库
- /bookmarks        本地收藏(localStorage)
- /donate           赞赏(默认隐藏)
- /about            关于
- /rss.xml          RSS 订阅
- /admin            后台(仅博主可入)
`;
