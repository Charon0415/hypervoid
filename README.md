<div align="center">

# ✦ Hypervoid

**The world is big, you have to go and see.**

_A personal blog from a self-coined word — *hyper* + *void* — where Charon writes about everything worth recording._

🌐 [hypervoid.vercel.app](https://hypervoid.vercel.app)
&nbsp;·&nbsp;
📖 [About](https://hypervoid.vercel.app/about)
&nbsp;·&nbsp;
📡 [RSS](https://hypervoid.vercel.app/rss.xml)
&nbsp;·&nbsp;
🏷️ [Tags](https://hypervoid.vercel.app/tags)

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

Articles live in **Postgres**, images in **Vercel Blob**, comments in **GitHub Discussions**, and the whole site auto-deploys on every push to `main`. The admin panel writes directly to the database; no rebuilds needed per post.

## ✦ Features

### Reader-facing

- **MDX articles** with [Shiki](https://shiki.style) syntax highlighting (theme-aware, language list pinned for low memory footprint)
- **Tags** — index + per-tag filtered list, **Chinese tags supported** (e.g. `/tags/元信息`)
- **Sticky TOC** with `IntersectionObserver` scroll-spy
- **System / light / dark** theme toggle via `next-themes`
- **RSS 2.0** feed + **`sitemap.xml`** + dynamic **OG image**
- **Comments** via [Giscus](https://giscus.app) (backed by GitHub Discussions, `strict=1` to avoid duplicate-thread bug)
- **View counter** + **like button** with `localStorage`-tracked toggle (atomic Postgres upserts)

### Author-facing

- **Admin panel** at `/admin` — GitHub-OAuth-gated, only the configured login allowed (`ADMIN_GITHUB_LOGIN`)
- **In-browser MDX editor** — title-driven auto-slug (ASCII only), tag/category/cover fields, status select
- **Draft / scheduled / published** workflow — scheduled posts auto-appear at `publishAt` via SQL `WHERE` clause, then a **daily cron** normalizes the status field
- **One-click image upload** to Vercel Blob — markdown `![alt](url)` injected at cursor position
- **ISR** (60s revalidate) on listing pages so changes appear without redeploy

### Site map

```
/              首页 (latest posts)
/posts         所有文章
/posts/[slug]  文章详情 (TOC + views + likes + comments)
/tags          所有标签
/tags/[tag]    标签筛选
/anime         番剧追番
/projects      项目
/skills        技能
/timeline      时间线
/albums        相册
/diary         日记
/friends       友链
/about         关于
/admin         后台 (GitHub OAuth)
```

## ✦ Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | [React 19](https://react.dev) + [Tailwind CSS v4](https://tailwindcss.com) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Content | [`next-mdx-remote`](https://github.com/hashicorp/next-mdx-remote) + `remark-gfm` + `rehype-slug` + `rehype-autolink-headings` |
| Syntax | [Shiki](https://shiki.style) via `@shikijs/rehype` |
| Data | [Postgres](https://www.postgresql.org) on [Neon](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Auth.js v5](https://authjs.dev) + GitHub provider |
| Images | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (1 GB free) |
| Comments | [Giscus](https://giscus.app) |
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

# 2. Push schema + (optional) seed legacy MDX files
pnpm db:push
pnpm exec tsx scripts/migrate-mdx-to-db.ts

# 3. Run
pnpm build && pnpm start   # production preview (light on memory, recommended)
# or
pnpm dev                   # hot reload (heavier)
```

> ⚠ If `pnpm dev` causes browser / IDE crashes, run with
> `NODE_OPTIONS=--max-old-space-size=4096 pnpm dev` —
> Shiki + Turbopack on Next 16 can eat RAM aggressively.

## ✦ Roadmap

- [x] **v0.1** — multi-page scaffold · MDX · theme toggle
- [x] **v0.2** — RSS · sitemap · OG image · TOC · tag pages
- [x] **v0.3** — Giscus comments · view counter · like button
- [x] **v0.4** — admin panel · MDX editor · draft & scheduled publishing · image upload
- [ ] **v0.5** — newsletter (Resend) · self-hosted analytics (Umami) · full-text search (Postgres FTS / Meilisearch)
- [ ] **v1.0** — i18n · members & paywall (Stripe) · AI summary & Q&A · guestbook · friends links · album gallery

## ✦ License

Code: **MIT**.
Articles, images and original content: [**CC BY-NC-SA 4.0**](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## ✦ Credits

Built by **Charon** — [@HyperCharon](https://github.com/HyperCharon) on GitHub, [@Charon0415](https://space.bilibili.com/405927049) on Bilibili.

_One &amp; Only_
