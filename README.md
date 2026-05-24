<div align="center">

# ✦ Hypervoid

**The world is big, you have to go and see.**

_A personal blog from a self-coined word — *hyper* + *void* — where Charon writes about everything worth recording._

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
- **Pinned posts** + **prev/next nav** at the bottom of every article
- **Reading progress bar** at the top of article pages
- **Hover-expand share buttons** (copy link · X · Weibo)
- **Tags** — index + per-tag filtered list, Chinese tags supported (e.g. `/tags/元信息`)
- **Sticky TOC** with IntersectionObserver scroll-spy (active section highlighted)
- **System / light / dark** theme toggle + **hue picker** for primary color
- **RSS 2.0** feed + `sitemap.xml` + dynamic OG image
- **Comments** via [Giscus](https://giscus.app) (`mapping="pathname"` so domain change keeps history)
- **View counter** + **like button** with localStorage-tracked toggle (atomic Postgres upserts)
- **AI summary** per article + **AI Q&A** modal (Claude Haiku 4.5, streamed)
- **Full-text search** (pg_trgm GIN index, works for Chinese substrings) with **⌘K / Ctrl+K** shortcut
- **Back-to-top** floating button + page fade-in transition
- **Sidebar widgets**: profile card · mini calendar · 365-day heatmap · popular posts · tag cloud · recent guestbook · site stats · email subscribe
- **Custom pages**: `/anime` · `/projects` · `/skills` · `/timeline` · `/albums` · `/diary` · `/friends` · `/guestbook` · `/archive`
- **Bilingual UI** (zh-CN / en) via custom React Context — no URL prefix
- **Mobile-first** responsive layout + hamburger nav

### Author-facing

- **Admin panel** at `/admin` — GitHub-OAuth-gated, only the configured login allowed (`ADMIN_GITHUB_LOGIN`)
- **In-browser MDX editor** — title-driven auto-slug, tag/category/cover fields, status select
- **Draft / scheduled / published** workflow — scheduled posts auto-appear at `publishAt`; **daily cron** at 04:00 UTC normalizes the status field
- **One-click image upload** to Vercel Blob — markdown `![alt](url)` injected at cursor
- **AI summary generation** — one click → Haiku writes a 2-3 sentence summary, saved to `posts.summary`
- **Friends / albums / guestbook** CRUD pages under `/admin`
- **Email subscriber list** — confirmed-only via double opt-in, Resend backend

### Site map

```
/              首页 (latest posts + sidebar widgets)
/posts         所有文章
/posts/[slug]  文章详情 (TOC · views · likes · AI Q&A · comments · prev/next · share)
/tags          所有标签 (with counts)
/tags/[tag]    标签筛选
/archive       归档 (按年月)
/anime         番剧
/projects      项目
/skills        技能
/timeline      时间线
/albums        相册首页
/albums/[slug] 相册详情
/diary         日记
/friends       友链
/guestbook     留言板
/about         关于
/search        全文搜索
/admin         后台 (GitHub OAuth)
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
- [x] **v1.0** — i18n · guestbook · friends · albums · AI summary & Q&A (Claude Haiku 4.5)
- [x] **Phase 7-9 polish** — GFM alerts · KaTeX · pinned posts · image lightbox · theme color picker · starfield · sidebar widgets (heatmap, popular posts, tag cloud, mini calendar, recent guestbook) · mobile drawer · code-block decoration · prev/next nav · reading progress bar · share buttons · ⌘K search · back-to-top · custom domain (hypervoid.top)
- [ ] **Future** — article-level i18n (`posts.locale`) · Resend custom domain · admin UX polish

## ✦ License

Code: **MIT**.
Articles, images and original content: [**CC BY-NC-SA 4.0**](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## ✦ Credits

Built by **Charon** — [@HyperCharon](https://github.com/HyperCharon) on GitHub, [@Charon0415](https://space.bilibili.com/405927049) on Bilibili.

_One &amp; Only_
