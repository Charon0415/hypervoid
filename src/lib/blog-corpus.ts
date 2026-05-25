import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads README.md and docs/handbook.md from disk at runtime so Kanna's
 * chat persona stays in sync with whatever the current docs say —
 * updating the README updates her knowledge on the next cold start, no
 * code change required.
 *
 * Memoized per process. On Vercel the files are bundled via
 * `outputFileTracingIncludes` in next.config.ts so they're reachable
 * from serverless functions.
 */

let _cached: { corpus: string; loadedAt: number } | null = null;

function safeRead(relPath: string): string {
  try {
    return readFileSync(join(process.cwd(), relPath), "utf-8");
  } catch {
    return "";
  }
}

/** Headings only — a TOC the model can use to know what handbook chapters exist. */
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
    // Find the next ## chapter heading after this one
    const nextHeading = handbook.slice(start + wanted[i].length).search(/\n## [^#]/);
    const end = nextHeading < 0 ? handbook.length : start + wanted[i].length + nextHeading;
    out.push(handbook.slice(start, end).trim());
  }
  return out.join("\n\n");
}

export function getBlogCorpus(): string {
  if (_cached && Date.now() - _cached.loadedAt < 60_000) return _cached.corpus;

  const readme = safeRead("README.md");
  const handbook = safeRead("docs/handbook.md");

  const sections: string[] = [];

  if (readme) {
    sections.push("=== README.md (站点说明 + 路由表 + 功能清单) ===");
    sections.push(readme);
  }

  if (handbook) {
    sections.push("\n=== 手册章节索引 ===");
    sections.push(extractHandbookToc(handbook));
    sections.push("\n=== 手册相关章节 ===");
    sections.push(extractRelevantChapters(handbook));
  }

  const corpus = sections.join("\n").slice(0, 24_000);
  _cached = { corpus, loadedAt: Date.now() };
  return corpus;
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
