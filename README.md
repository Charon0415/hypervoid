<div align="center">

# ✦ Hypervoid

**The world is big, you have to go and see.**

_A personal coordinate carved out of `hyper` × `void` — "高维虚空" — Charon's long-form record of technology, reading, anime, games, and life._

🌐 [hypervoid.top](https://hypervoid.top)
&nbsp;·&nbsp;
📖 [About](https://hypervoid.top/about)
&nbsp;·&nbsp;
📡 [RSS](https://hypervoid.top/rss.xml)
&nbsp;·&nbsp;
🏷️ [Tags](https://hypervoid.top/tags)
&nbsp;·&nbsp;
📘 [Handbook](docs/handbook.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![Postgres](https://img.shields.io/badge/Postgres-Neon-336791?style=flat-square&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)

</div>

---

## ✦ About

**Hypervoid** is the source of my personal blog & digital garden — built from an empty directory, no template, every line designed to grow with me.

Articles live in **Postgres**, images in **Vercel Blob**, comments in **GitHub Discussions**, and the whole site auto-deploys on every push to `main`. The admin panel writes directly to the database; no rebuilds needed per post. AI summary and Q&A run on Claude Haiku 4.5.

## ✦ Features

### Reader-facing

- **MDX articles** with [Shiki](https://shiki.style) syntax highlighting — filename header, copy button, language label
- **GFM alerts** (`> [!NOTE]` etc.) + **KaTeX math** + **reading time** (CJK-aware)
- **Pinned posts** + **prev/next nav** + **article series** (multi-part collections with sibling-article banner)
- **Reading progress bar** + **reading mode** toggle (normal / sepia / sepia+large)
- **"✓ 已读" badge** on visited articles (localStorage, after 6 s dwell) + **"↻ 更新于"** badge when revised
- **Visitor bookmarks** — save articles to a personal `/bookmarks` page (localStorage)
- **Hover-expand share buttons** (copy link · X · Weibo) + **/donate** scaffolding (off behind a feature flag)
- **Tags** index + per-tag pages + **search filters** (filter results by tag/year chips)
- **Full-text search** (pg_trgm GIN, Chinese substrings) with **⌘K / Ctrl+K** shortcut
- **Sticky TOC** with IntersectionObserver scroll-spy
- **Single / double column toggle** on `/posts`, `/tags/[tag]`, `/archive`
- **Site settings panel** — 6 palettes + free hue · **6 backgrounds** (cosmic / particles / acg / paper / waves / plain) · **3 display modes** (fullscreen / banner / simple) · 3 fonts
- **System / light / dark** theme + **cosmic-orbit favicon** (custom SVG) + **per-article OG image** (auto-sized title, brand mark)
- **RSS 2.0** feed + `sitemap.xml` + PWA manifest + apple-touch icon
- **Comments** via [Giscus](https://giscus.app) (`mapping="pathname"`)
- **View counter** + **like button** with localStorage-tracked toggle (atomic Postgres upserts)
- **AI summary** + **AI Q&A** modal (Claude Haiku 4.5, streamed)
- **Bangumi** integration — **anime** (detail modal with rating histogram) · **movies** · **books** (subject types 2/6/1)
- **Steam game library** — `/games`, recent-2-weeks + total playtime + search + sort
- **Cosmic-themed 404** with random article recommendation
- **Back-to-top** floating button + page fade-in transition
- **Sidebar widgets**: profile card · mini calendar · 365-day heatmap · popular posts · tag cloud · recent guestbook · site stats · email subscribe
- **Custom pages**: `/projects` · `/skills` · `/timeline` · `/albums` · `/diary` · `/friends` · `/guestbook` · `/archive` · `/series`
- **Bilingual UI** (zh-CN / en) via custom React Context
- **Mobile-first** responsive layout + hamburger drawer

### Author-facing

- **Admin dashboard** at `/admin` — stats (posts/views/likes/subscribers) · recent published · pending counters (drafts / scheduled / private / missing-summary)
- **GitHub-OAuth-gated** — only `ADMIN_GITHUB_LOGIN` may enter
- **In-browser MDX editor** — title-driven slug · tags · category · cover · status · **public/private visibility** · **article series + order**
- **AI tag suggestions** — Claude Haiku reads the draft and proposes 3-5 tags biased toward your existing taxonomy
- **AI summary** — manual one-click + **auto-generated on first publish** via `next/server`'s `after()` (no editor wait)
- **Draft / scheduled / published** workflow + **daily cron** at 04:00 UTC + **comment moderation** deep-link to the underlying GitHub Discussion
- **One-click image upload** to Vercel Blob — markdown `![alt](url)` injected at cursor
- **Friends / albums / guestbook** CRUD with pill-style admin nav
- **Email subscriber list** — confirmed-only via double opt-in, Resend backend
- **Print-friendly stylesheet** — `Ctrl/⌘+P` strips chrome, keeps article body

### Site map

```
/              首页 (latest posts + sidebar widgets)
/posts         所有文章
/posts/[slug]  文章详情 (TOC · views · likes · AI Q&A · comments · prev/next · share)
/tags          所有标签 (with counts)
/tags/[tag]    标签筛选
/archive       归档 (按年月)
/anime         番剧
/movies        影视 (Bangumi subject_type=6)
/books         书籍 (Bangumi subject_type=1)
/games         Steam 游戏库
/projects      项目
/skills        技能
/timeline      时间线
/albums        相册首页
/albums/[slug] 相册详情
/diary         日记
/friends       友链
/guestbook     留言板
/about         关于
/search        全文搜索 (?q + ?tag + ?year)
/series        文章系列索引
/series/[name] 单个系列详情
/bookmarks     本地收藏夹 (localStorage)
/donate        赞赏页 (默认隐藏，受 siteConfig.donate.enabled 控制)
/admin         后台 dashboard (GitHub OAuth)
```

## ✦ Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | [React 19](https://react.dev) + [Tailwind CSS v4](https://tailwindcss.com) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Content | [`next-mdx-remote`](https://github.com/hashicorp/next-mdx-remote) + `remark-gfm` + `remark-math` + `remark-github-blockquote-alert` + `rehype-katex` + `rehype-slug` + `rehype-autolink-headings` |
| Syntax | [Shiki](https://shiki.style) via `@shikijs/rehype` (custom transformer for filename/lang meta) |
| Data | [Postgres](https://www.postgresql.org) on [Neon](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team) |
| Search | Postgres `pg_trgm` extension + GIN index |
| Auth | [Auth.js v5](https://authjs.dev) + GitHub provider |
| Images | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Comments | [Giscus](https://giscus.app) |
| Email | [Resend](https://resend.com) |
| Analytics | [Umami Cloud](https://umami.is) |
| AI | [Anthropic SDK](https://docs.anthropic.com) (Claude Haiku 4.5, streamed) |
| Hosting | [Vercel](https://vercel.com) (Hobby tier + daily cron) |

## ✦ Run locally

```bash
git clone https://github.com/HyperCharon/hypervoid.git
cd hypervoid
pnpm install

# 1. Copy env template and fill in your own credentials
cp .env.example .env.local
#   - DATABASE_URL          (Neon project)
#   - AUTH_SECRET           (openssl rand -base64 32)
#   - AUTH_GITHUB_ID/SECRET (https://github.com/settings/developers)
#   - ADMIN_GITHUB_LOGIN    (your GitHub username)
#   - NEXT_PUBLIC_GISCUS_*  (https://giscus.app)
#   - BLOB_READ_WRITE_TOKEN (Vercel Blob)
#   - RESEND_API_KEY        (optional, for newsletter)
#   - ANTHROPIC_API_KEY     (optional, for AI summary/Q&A)
#   - NEXT_PUBLIC_UMAMI_WEBSITE_ID (optional)

# 2. Push schema, then rebuild full-text search indexes (db:push drops them)
pnpm db:push
pnpm exec tsx scripts/setup-search.ts

# 3. Run
pnpm build && pnpm start   # production preview (light on memory, recommended)
# or
pnpm dev                   # hot reload (heavier)
```

> ⚠ If `pnpm dev` crashes the browser / IDE, switch to `pnpm build && pnpm start`. Shiki + Turbopack on Next 16 can eat RAM aggressively.

## ✦ Documentation

For day-to-day operation — how to write a post, customize the theme, manage DNS, debug deployment, back up data — see the comprehensive **[Handbook](docs/handbook.md)**.

## ✦ Roadmap

- [x] **v0.1** — multi-page scaffold · MDX · theme toggle
- [x] **v0.2** — RSS · sitemap · OG image · TOC · tag pages
- [x] **v0.3** — Giscus comments · view counter · like button
- [x] **v0.4** — admin panel · MDX editor · draft & scheduled publishing · image upload
- [x] **v0.5** — newsletter (Resend) · analytics (Umami Cloud) · full-text search (pg_trgm)
- [x] **v1.0** — i18n · guestbook · friends · albums · AI summary & Q&A · live site-settings editor · 70+ features shipped
- [ ] **v1.x** — article-level i18n · Resend custom domain · ACG wallpapers activation · donate QR codes

## ✦ License

Code: **MIT**.
Articles, images and original content: [**CC BY-NC-SA 4.0**](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## ✦ Credits

Built by **Charon** — [@HyperCharon](https://github.com/HyperCharon) on GitHub, [@Charon0415](https://space.bilibili.com/405927049) on Bilibili.

_One &amp; Only_
