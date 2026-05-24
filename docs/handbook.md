# Hypervoid 完全指南

> 这是你将来独立维护 Hypervoid 的工具书。覆盖**日常运营**、**站点定制**、**部署运维**、**故障排查**、**扩展开发**——遇到任何"这该怎么做"的问题，先查这里。

**最近更新：** 2026-05-24（Phase 9 + 当日多轮迭代）
**对应站点：** https://hypervoid.top

---

## 目录

- [一、项目概览](#一项目概览)
- [二、本地开发](#二本地开发)
- [三、内容创作](#三内容创作)
- [四、站点定制](#四站点定制)
- [五、部署与运维](#五部署与运维)
- [六、数据备份与恢复](#六数据备份与恢复)
- [七、故障排查](#七故障排查)
- [八、成本与监控](#八成本与监控)
- [九、扩展开发](#九扩展开发)
- [十、版本管理与协作](#十版本管理与协作)
- [附录](#附录)

---

## 一、项目概览

### 1.1 这是什么

**Hypervoid**（取自 *hyper* × *void*「高维虚空」）是一个完整的个人博客系统，从空目录手搓出来。它不只是"渲染 Markdown 的静态站"，更接近一个**带后台的内容管理系统 + 数据驱动的个人主页**：

- **文章存数据库**，不在仓库里。无需 redeploy 即可发布
- **后台 `/admin`** 是浏览器内的所见即所得 MDX 编辑器
- **图片上传** 到 Vercel Blob，1GB 免费
- **AI 摘要 / Q&A** 由 Claude Haiku 4.5 驱动
- **评论** 接 GitHub Discussions（Giscus），强一致映射
- **订阅邮件** 走 Resend，新文章自动通知订阅者
- **统计分析** 用 Umami Cloud，无 Cookie 合规
- **追番** 接入 Bangumi (bgm.tv) API，自动同步
- **站点设置面板**：6 预设调色板、5 种背景、3 种字体，全 localStorage 持久化
- **阅读模式**：文章页可切 sepia / sepia+大号，作用域仅在 `<article>` 不污染全局
- **多页面** 包括相册、友链、留言、归档、番剧、技能、时间线、日记

### 1.2 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 视图 | React 19 + Tailwind CSS v4 + `@tailwindcss/typography` |
| 内容 | `next-mdx-remote/rsc` + remark/rehype 插件链 |
| 代码高亮 | Shiki + `@shikijs/rehype` |
| 数据库 | Postgres on Neon (免费 0.5GB) |
| ORM | Drizzle |
| 认证 | Auth.js v5 + GitHub OAuth |
| 图床 | Vercel Blob (免费 1GB) |
| 评论 | Giscus (GitHub Discussions) |
| 邮件 | Resend |
| 统计 | Umami Cloud |
| AI | Anthropic SDK (Claude Haiku 4.5) |
| 部署 | Vercel Hobby |

### 1.3 数据流向

```
  浏览器请求
      │
      ▼
┌──────────────┐      ┌──────────────┐
│  Vercel Edge │◄────►│   Neon DB    │  ← 文章/评论计数/订阅/友链/相册
│   (Next.js)  │      └──────────────┘
└──────┬───────┘
       │              ┌──────────────┐
       ├─────────────►│ Vercel Blob  │  ← 图片
       │              └──────────────┘
       │              ┌──────────────┐
       ├─────────────►│ Anthropic API│  ← AI 摘要 / Q&A
       │              └──────────────┘
       │              ┌──────────────┐
       ├─────────────►│   Resend     │  ← 订阅邮件
       │              └──────────────┘
       ▼
   返回 HTML/JSON
       │
       ▼
   浏览器渲染
   ├── Giscus iframe → github.com Discussions
   └── Umami script  → cloud.umami.is
```

---

## 二、本地开发

### 2.1 环境准备

需要安装：

- **Node.js** ≥ 20（建议用 `nvm` 管理版本）
- **pnpm** ≥ 9（`npm i -g pnpm`）
- **Git**

可选：

- **Drizzle Studio** —— 已内置（`pnpm db:studio`）
- **gh CLI** —— 用于 GitHub 操作（`brew install gh` 或 [官方](https://cli.github.com)）

### 2.2 启动方式

**生产模式预览（推荐，省内存）：**

```bash
pnpm build && pnpm start
# 默认在 http://localhost:3000
```

**开发模式（热重载，吃内存）：**

```bash
pnpm dev
```

> ⚠ Shiki + Turbopack + 大量页面会让 `pnpm dev` 吃几个 G 内存，可能拖卡 Claude/浏览器。如果发现卡顿，回退到 `pnpm build && pnpm start`。

### 2.3 环境变量清单

完整变量见 `.env.example`。**必填的**（缺一个站点就跑不起来）：

```bash
# 数据库
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# 认证 - GitHub OAuth App (https://github.com/settings/developers)
AUTH_SECRET=                      # openssl rand -base64 32
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
ADMIN_GITHUB_LOGIN=HyperCharon    # 只有这个用户能进 /admin

# 评论 - Giscus (https://giscus.app 生成)
NEXT_PUBLIC_GISCUS_REPO=HyperCharon/hypervoid
NEXT_PUBLIC_GISCUS_REPO_ID=
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=

# 图床 - Vercel Blob
BLOB_READ_WRITE_TOKEN=            # Vercel 项目连接 Blob 后自动注入
```

**强烈建议**（功能会缺一块）：

```bash
RESEND_API_KEY=re_xxxxxxx         # 没有这个 → 订阅不工作
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Hypervoid

NEXT_PUBLIC_UMAMI_WEBSITE_ID=     # 没有 → 没统计
ANTHROPIC_API_KEY=sk-ant-xxxxx    # 没有 → AI 摘要和 Q&A 不可用
```

**可选**：

```bash
CRON_SECRET=                      # 如果设置了，定时任务路由要求 Bearer 认证
NEXT_PUBLIC_UMAMI_SCRIPT_URL=     # 自建 Umami 时填，云端默认硬编码
```

### 2.4 常用命令

| 命令 | 干啥 |
|---|---|
| `pnpm dev` | 开发模式 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 跑构建产物 |
| `pnpm lint` | ESLint |
| `pnpm tsc --noEmit` | 类型检查（不输出文件，最快） |
| `pnpm db:generate` | 根据 schema 变化生成迁移 SQL |
| `pnpm db:push` | 把 schema 直接推到数据库（开发用，**会丢索引**，见 [7.4](#74-数据库连接超时--搜索没结果)） |
| `pnpm db:studio` | Drizzle 可视化界面，本地浏览/编辑表 |
| `pnpm exec tsx scripts/setup-search.ts` | 重建 pg_trgm 全文搜索索引（**push 之后必跑**） |
| `pnpm exec tsx scripts/migrate-mdx-to-db.ts` | 一次性把 src/content/posts/ 下的 .mdx 文件导入数据库（已执行过，仓库里没残留文件） |

### 2.5 项目结构

```
src/
├── app/                # Next.js App Router 页面
│   ├── layout.tsx      # 根布局：Header + Footer + Starfield + BackToTop
│   ├── page.tsx        # 首页
│   ├── posts/          # 文章列表 & 详情
│   ├── tags/           # 标签
│   ├── admin/          # 管理后台
│   ├── api/            # API 路由（auth、订阅、AI Q&A、cron、upload）
│   ├── about/          # About 页
│   ├── albums/         # 相册
│   ├── friends/        # 友链
│   ├── guestbook/      # 留言板
│   ├── archive/        # 归档
│   ├── search/         # 搜索
│   └── sitemap.ts      # sitemap.xml 生成
├── components/         # React 组件
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── ProfileCard.tsx
│   ├── CodeBlock.tsx
│   ├── ReadingProgress.tsx
│   ├── BackToTop.tsx
│   ├── ShareButtons.tsx
│   ├── PostNav.tsx
│   └── ...
├── lib/                # 共享工具
│   ├── site-config.ts  # ⭐ 站点身份单一来源
│   ├── posts.ts        # 文章查询逻辑
│   ├── ai.ts           # Anthropic 调用封装
│   ├── i18n.ts         # 中英文翻译表
│   ├── newsletter.ts   # 订阅邮件发送
│   ├── email.ts        # Resend 通用封装
│   └── shiki-meta.ts   # Shiki 自定义 transformer
└── db/                 # 数据库
    ├── schema.ts       # ⭐ 表结构定义
    ├── client.ts       # 连接初始化
    └── *.ts            # 其他数据访问辅助函数

scripts/                # 一次性脚本
docs/                   # 文档（本文档在这里）
public/                 # 静态资源
drizzle/                # 迁移 SQL 历史
```

⭐ 标的两个文件是**改起来最频繁、影响最大**的：`site-config.ts` 改身份信息，`schema.ts` 改数据库结构。

---

## 三、内容创作

### 3.1 写一篇新文章

1. **登录后台**：访问 https://hypervoid.top/admin，用 GitHub 登录（必须是 `ADMIN_GITHUB_LOGIN` 配的那个账号）
2. **新建**：点 `/admin/posts` → `New post`
3. **填字段**：
   - **Title** —— 自动生成 slug（仅 ASCII）
   - **Slug** —— URL 路径，建议保持自动生成或手动 kebab-case
   - **Description** —— 列表卡片上显示的摘要（不要超过 120 字）
   - **Category** —— 单选分类
   - **Tags** —— 逗号分隔多个，**支持中文**
   - **Cover** —— 封面图 URL（可上传）
   - **Status** —— `draft` / `scheduled` / `published`
   - **Publish at** —— 计划发布时间（scheduled 状态用）
   - **Content** —— MDX 主体
4. **Save**：保存草稿
5. **Publish**：状态改成 `published` 并保存
6. 文章页 ISR 60 秒生效，等一分钟刷新就能看到

### 3.2 草稿 / 定时 / 发布

| 状态 | 含义 | 可见性 |
|---|---|---|
| `draft` | 草稿 | 仅你（管理员）能看 |
| `scheduled` | 定时发布 | `publishAt` 时间前不可见，到时间自动可见（SQL 层判断 + 04:00 UTC daily cron 矫正状态字段） |
| `published` | 已发布 | 所有人可见 |

> 文章列表查询用 `WHERE status = 'published' OR (status = 'scheduled' AND publishAt <= NOW())`，所以**定时发布不依赖 cron**——cron 只是把数据库状态字段同步成 `published` 让管理员视角一致。

### 3.3 MDX 语法速查

**基础 Markdown** —— GFM 全支持（表格、任务清单、删除线、自动链接）。

**代码块** —— 自动 Shiki 高亮 + 顶部装饰：

````md
```ts filename="src/lib/posts.ts"
import { eq } from "drizzle-orm";

export async function getPost(slug: string) {
  return db.select().from(posts).where(eq(posts.slug, slug));
}
```
````

→ 渲染时顶栏显示「TS」语言标签 + 文件名 + 复制按钮。

**支持的语言** —— 见 `src/app/posts/[slug]/page.tsx` 的 `langs:` 数组（默认含 ts/tsx/js/jsx/json/md/mdx/bash/sh/css/html/yaml/python）。要加新语言，往那个数组追加即可。

**GFM 提示框**：

```md
> [!NOTE]
> 这是一条注释。

> [!WARNING]
> 这是警告。
```

**KaTeX 数学公式**：

```md
行内：$E = mc^2$

块级：

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**图片** —— 上传图片获得 URL 后：

```md
![描述文字](https://blob.vercel-storage.com/xxx.jpg)
```

点开后会有图片灯箱效果。

### 3.4 图片上传

后台编辑器有「上传图片」按钮，会把图片 PUT 到 Vercel Blob，然后把 markdown 语法插到光标位置。**单次上传上限 4.5MB**（Vercel Blob API 限制），更大文件需分片上传——目前不支持。

直接拖图到 MDX 编辑器**没有**自动上传，必须点按钮。

### 3.5 AI 摘要

在已发布文章后台编辑页，有个「生成 AI 摘要」按钮。点击：

1. 后端调 Claude Haiku 4.5
2. 摘要保存到 `posts.summary` 字段
3. 文章页头部显示「✦ AI 摘要」区块

**单次成本** 约 ¥0.0015（按 Haiku 当前定价 + 一篇 2000 字文章估算）。

**手动调用**，不是自动 —— 你可以让某些文章没有 AI 摘要。

### 3.6 标签和分类

- **标签**：多选，文章可以有任意个标签。点击文章页的标签或访问 `/tags/{标签名}` 看该标签下所有文章。中文标签 OK。
- **分类**：单选，文章只能属于一个分类。比标签更"重"，适合做粗粒度分组（如「技术」「生活」「游戏」）。

两者完全独立，按需用。

### 3.7 其他可发布的内容

| 内容 | 后台路径 | 说明 |
|---|---|---|
| 友链 | `/admin/friends` | 名称、URL、头像、简介 |
| 相册 | `/admin/albums` | 创建相册 → 进相册编辑 → 批量上传照片 |
| 留言 | `/guestbook` | 公开任何 GitHub 用户可登录留言，管理员可删 |
| 订阅者 | （数据库直查） | 通过 `/api/subscribe` 收订阅，邮件双向确认 |

---

## 四、站点定制

### 4.1 站点信息（`src/lib/site-config.ts`）

这是**站点身份的单一来源**——OG 图、RSS 标题、ProfileCard 信息、社交链接、建站日期全都从这里读：

```ts
export const siteConfig = {
  name: "Hypervoid",
  title: "Hypervoid · Charon 的博客",
  description: "分享技术、记录生活、收集兴趣。Charon 的个人博客。",
  url: "https://hypervoid.top",          // 改这里 → 全站 URL 跟着变
  launchedAt: "2026-05-23",              // Footer 「Since」徽章
  locale: "zh_CN",
  author: {
    name: "Charon",
    handle: "HyperCharon",
    bio: "The world is big, you have to go and see.",
    avatar: "/avatar.jpg",  // 默认本地 public/avatar.jpg；GitHub 头像在国内偶发不可达，已弃用
    githubUsername: "HyperCharon",
    githubUrl: "https://github.com/HyperCharon",
  },
  socials: [
    { name: "GitHub", url: "...", icon: "github" },
    { name: "Bilibili", url: "...", icon: "bilibili" },
    // 添加新社交平台时，同时去 src/components/SocialIcon.tsx 添加图标
  ],
  rss: { title: "Hypervoid", description: "..." },
} as const;
```

改完 `pnpm build` 看一下，没问题就提交。

### 4.2 站点设置面板（主题 / 背景 / 字体）

入口在导航栏右侧的**彩色圆点按钮**，点开是统一的设置面板。所有设置存 localStorage（key 前缀 `hypervoid:`），全局生效。

**架构** —— `src/components/SettingsProvider.tsx` 是 Context，挂在根 layout，管理三个全局状态：

| 状态 | localStorage key | 应用方式 |
|---|---|---|
| `hue` (主题色色相 0-360°) | `hypervoid:hue` | `<html>` 的 `--primary` 内联样式 |
| `background` | `hypervoid:bg` | `<html data-bg="...">` 属性 |
| `font` | `hypervoid:font` | `<html data-font="...">` 属性 |

**预设调色板** —— 6 个（Indigo 默认 / Sakura / Ocean / Forest / Amber / Violet），存在 `HUE_PRESETS` 数组。加新预设：在 `SettingsProvider.tsx` 的 `HUE_PRESETS` 加一行 `{ name: 'Custom', hue: 123 }`。

**背景** —— 5 种（cosmic / particles / plain / paper / waves），在 `Backdrop.tsx`（canvas 类）+ `globals.css`（纯 CSS 类）共同实现：
- `cosmic` / `particles` —— canvas 粒子，根据深浅色切换数量和颜色
- `plain` —— 啥都不渲染
- `paper` —— CSS 双向 1px 栅格 + 透明度
- `waves` —— 三层径向渐变 + `wavesShift` 24s 动画

加新背景：
1. `BACKGROUND_OPTIONS` 里加一项
2. 如果是 canvas 类：在 `Backdrop.tsx` 的 useEffect 里加分支
3. 如果是 CSS 类：在 `globals.css` 加 `html[data-bg="新值"] body::before { ... }` 规则

**字体** —— 3 种（Geist 默认 / Serif / Handwriting），通过 `html[data-font="..."] body { font-family: ... }` 改变。**没下载额外资源**，只用系统字体回落链。加新字体方案：
1. `FONT_OPTIONS` 里加一项
2. `globals.css` 加 `html[data-font="新值"] body { font-family: ... }` 规则
3. 如果非常需要某个非系统字体（例如真的想要 LXGW WenKai），用 `next/font/google` 或 CDN 加载，但要权衡包体积

**3.3 重置全部** —— 面板右上「重置全部」按钮一键清掉 localStorage 的三个 key，恢复默认。

### 4.3 深浅色 / 系统主题

由 `next-themes` 管理，按钮是 `src/components/ThemeToggle.tsx`。深浅色和主题色完全独立——主题色（hue）会同时影响浅色和深色模式。

要改默认配色（背景 / 卡片 / 文字 / 边框等基础色），编辑 `src/app/globals.css` 顶部的 `:root` 和 `.dark` 块。

### 4.4 导航菜单

**桌面端** —— `src/components/NavGroups.tsx` 控制顶部胶囊式分组导航。要加/删菜单项：

```ts
// 简化展示——具体结构看文件
const groups = [
  { label: "创作", items: [...] },
  { label: "生活", items: [...] },
  { label: "交互", items: [...] },
];
```

**移动端** —— `src/components/MobileNav.tsx` 是抽屉式菜单，要保持和桌面端的菜单项一致。

**i18n** —— 导航文字走 `src/lib/i18n.ts`，加新菜单时也要同步加翻译。

### 4.5 侧边栏 widgets

主页右侧侧边栏在 `src/app/page.tsx` 里组装，包含：

- `<ProfileCard />` —— 头像 + 简介 + 社交图标
- `<MiniCalendar />` —— 当月日历，文章发布日期高亮
- `<PostActivityHeatmap />` —— 365 天活动热力图
- `<PopularPosts />` —— 浏览量 TOP 5
- `<TagCloud />` —— 标签云
- `<RecentGuestbook />` —— 最近 3 条留言
- `<SiteStats />` —— 文章数 / 标签数 / 总浏览
- `<SubscribeForm />` —— 邮件订阅入口

要加 widget：写组件 → 在 `page.tsx` 侧边栏区域插入即可。要删：删掉那一行 import + 组件渲染。顺序就是显示顺序。

### 4.6 页脚

`src/components/SiteFooter.tsx`。包含版权 + 站点运行时长 + GitHub/RSS 链接。

`SiteUptime` 组件读 `siteConfig.launchedAt` 自动计算天数。

### 4.7 About 页

`src/app/about/page.tsx` —— 纯 JSX，结构 + 内容都在一个文件里。直接编辑这个文件、提交、推送即可发布更新。

### 4.8 阅读模式（文章页专属）

文章详情页右上角的对话气泡图标 → 三档切换：

| 档位 | 效果 |
|---|---|
| **默认** | 跟随站点主题 |
| **护眼 (Sepia)** | 暖黄纸质背景，文字深棕。深色模式下变暗棕底浅色文字 |
| **护眼 · 大号** | sepia + 字体放大到 1.125rem，行高 1.85 |

实现在 `src/components/ReadingMode.tsx`。CSS 变量**局部作用域**到 `<article>` 元素：

```css
[data-reading="sepia"] article {
  --background: #f5edd6;
  --foreground: #5b4636;
  /* ... */
}
```

只覆盖文章卡片内的颜色，header / sidebar / footer 不受影响。状态存在 `localStorage["hypervoid:reading-mode"]`。

### 4.9 网站图标

`src/app/icon.svg` —— Next.js App Router 自动识别这个文件作为 favicon。当前是「宇宙轨道」设计（深色背景 + 三圈轨道 + 中心光点）。要换：

1. 直接替换 `src/app/icon.svg` 的 SVG 内容（保持 viewBox 64×64 推荐）
2. 大点的二级图标可加 `src/app/apple-icon.png` (180×180) 和 `src/app/icon.png` (192/512) —— Next.js 同样会自动识别 PWA 用途

### 4.10 Bangumi 番剧集成

`/anime` 页直接从 Bangumi (bgm.tv) API 拉取你的追番数据。**没有数据库存储，没有定时同步**，每小时一次按需 revalidate。

**配置：** `src/lib/site-config.ts` 的 `bangumiUserId` 字段（当前 `"1189551"`）。要换用户：改这里。

**列表 API：** `src/lib/bangumi.ts` 的 `fetchBangumiAnime(status)`，调 `https://api.bgm.tv/v0/users/{id}/collections`：
- `status` = `watching` / `done` / `wish` / `onhold` / `dropped` 对应 Bangumi 的 type 3/2/1/4/5
- 缓存 1 小时（`next: { revalidate: 3600 }`）
- 必须带 User-Agent header（Bangumi 强制要求），值由 `siteConfig.url` 自动拼

**详情 API：** `/api/bangumi/subject/[id]` 是服务端代理，避免浏览器跨域 + 提供 24 小时缓存。点番剧卡片打开 `<AnimeDetailModal>` 时调用，返回 summary / tags / rating distribution / infobox。

**调整显示**：
- 默认展示 watching / done(限 60) / wish(限 30)。改条数：`src/app/anime/page.tsx` 顶部的 `limit` 参数
- 把 done 升级到 large 卡：把 `<AnimeGrid items={...} />` 改成 `<AnimeGrid items={...} large />`
- 不显示某个分类：在 page.tsx 里删掉对应 section

**为什么不存数据库？** Bangumi 是真实信源，缓存就够；存数据库要做同步逻辑、处理删除/修改一致性，反不如直接拉。如果将来 Bangumi 限流厉害需要缓存层，可加一个 KV 或者 Postgres 表存 ETag。

---

## 五、部署与运维

### 5.1 Vercel 部署流程

**首次部署：**

1. GitHub 仓库 → Vercel Dashboard "Add New Project" → 选你的 hypervoid 仓库
2. 配置环境变量（[2.3](#23-环境变量清单) 全清单）
3. 关联 Vercel Blob（Storage → Connect Blob → 选 Production），`BLOB_READ_WRITE_TOKEN` 自动注入
4. Deploy

**日常部署：**

```bash
git push   # 推到 main → Vercel 自动部署 production
```

不到 main 的分支推过去会触发 Preview Deployment，独立 URL，不影响 production。

**回滚：** Vercel Dashboard → Deployments → 找历史版本 → ⋯ → Promote to Production。

### 5.2 自定义域名

**已配置：** hypervoid.top（apex 为主域，www 308 重定向到 apex），DNS 在阿里云。

**如果以后换域名或加二级域名**：

1. **在 Vercel 加域名**：Project → Settings → Domains → Add `新域名`
2. **看 Vercel 给的 DNS 要求**，常见两种：
   - A 记录：`@ → 76.76.21.21`
   - CNAME：`www → cname.vercel-dns.com`
3. **在阿里云 DNS 加上这些记录**：https://dns.console.aliyun.com
4. **如果显示 "DNS Change Recommended"** —— 可忽略，是建议不是错误
5. **如果显示 "Verification Needed"**（一般是该域名之前绑过别的 Vercel 账号）：
   - Vercel 会要求加 TXT 记录在 `_vercel.<域名>`
   - 在阿里云加 TXT，主机记录是 `_vercel`（apex）或 `_vercel.www`（子域），值照贴
6. **DNS 验证可能有 negative-cache** —— Vercel 第一次查到错值会缓存"未通过"状态。多点几次 Refresh 或等 15 分钟。**用 Google DoH 验证 DNS 真实状态**，不要用本地 `dig`（本地有 ISP 污染会返回 `198.18.0.15` 误导）：
   ```bash
   curl -s 'https://dns.google/resolve?name=_vercel.www.hypervoid.top&type=TXT' | python3 -m json.tool
   ```

**改完域名要同步更新**：

- `src/lib/site-config.ts` 的 `url` 字段
- GitHub OAuth App 的 Authorization callback URL（https://github.com/settings/developers）
- Umami Cloud 后台的网站 domain
- Resend 自定义发件人（可选，见 [5.6](#56-resend-自定义发件人)）

### 5.3 环境变量更新

**Vercel 后台：** Project → Settings → Environment Variables

- 改完任何 `NEXT_PUBLIC_*` 变量 **必须做一次 No-Cache Redeploy**——这些变量打包进客户端 JS，缓存命中不会重建
  - Deployments → 最新 → ⋯ → Redeploy → 取消勾选 "Use existing Build Cache"
- 改非 `NEXT_PUBLIC_*` 变量则下次正常构建就会生效

**本地 `.env.local`：** 直接编辑，保存即可。`pnpm dev` 启动时自动读。

### 5.4 数据库迁移

**改 schema** 流程：

1. 编辑 `src/db/schema.ts`（加表、加列、改类型）
2. 生成迁移 SQL：`pnpm db:generate`
3. **检查 `drizzle/` 目录下新生成的 SQL 文件**，确认操作符合预期
4. 推到数据库：`pnpm db:push`
5. **关键陷阱**：`db:push` 会丢掉**没写在 Drizzle schema 里**的索引，包括 pg_trgm 全文搜索索引。所以必须紧接着：
   ```bash
   pnpm exec tsx scripts/setup-search.ts
   ```
6. 提交 schema + 生成的迁移 SQL → 推到 main → Vercel 部署时执行（生产端如有需要还需手动跑同样命令）

> ⚠ 生产环境的 schema 同步不会自动运行 `db:push`。你需要在本地用**生产的 `DATABASE_URL`** 手动跑：
>
> ```bash
> DATABASE_URL="<生产环境的URL>" pnpm db:push --force
> DATABASE_URL="<生产环境的URL>" pnpm exec tsx scripts/setup-search.ts
> ```

### 5.5 计划任务（Cron）

`vercel.json` 配置：

```json
{
  "crons": [
    { "path": "/api/cron/publish-scheduled", "schedule": "0 4 * * *" }
  ]
}
```

意思是**每天 UTC 04:00**（北京时间正午）调用 `/api/cron/publish-scheduled`。这个路由扫数据库找 `status=scheduled` 且 `publishAt <= NOW()` 的文章，把状态改成 `published`。

要加新定时任务：

1. 写一个 `/api/cron/xxx` 路由
2. 在 `vercel.json` 加一条 `crons` 配置
3. 推送，Vercel 自动注册

> Vercel Hobby 套餐每天最多 2 个 cron 任务，每个任务最多每天 1 次。要更频繁需要升级到 Pro。

### 5.6 监控（Umami / Vercel Speed Insights）

**Umami**：

- 网址：https://cloud.umami.is
- 看到的：实时访客、PV/UV、热门页面、来源、设备
- 不收集 IP 和 Cookie，GDPR/CCPA 合规
- 想换网站 ID：编辑 Vercel 环境变量 `NEXT_PUBLIC_UMAMI_WEBSITE_ID`，然后 No-Cache Redeploy

**Vercel Speed Insights**（可选，未启用）：

- Vercel Dashboard → Project → Speed Insights → Enable
- 看到的：真实用户的 Web Vitals（LCP、CLS、INP）
- 免费 10K events/月
- 注入 ~3KB JS

### 5.7 Resend 自定义发件人

默认用 `onboarding@resend.dev`（沙箱发件人，每天 100 封）。要换成 `noreply@hypervoid.top`：

1. Resend Dashboard → Domains → Add Domain → `hypervoid.top`
2. Resend 给一组 DNS 记录（MX + SPF TXT + DKIM TXT，推荐再加 DMARC TXT）
3. 在阿里云 DNS 加上这些记录
4. 等 Resend 验证通过（10-30 分钟）
5. 修改 Vercel 环境变量：
   - `RESEND_FROM_EMAIL=noreply@hypervoid.top`
6. No-Cache Redeploy

---

## 六、数据备份与恢复

### 6.1 Postgres 数据备份

**Neon 自带回滚** —— Project → Branches，可以从任意时间点（默认 7 天保留）开一个新分支恢复。但**这不是真的备份**，账号丢了数据就全没了。

**手动导出（命令行）：**

```bash
pg_dump "<DATABASE_URL>" > backup-$(date +%Y%m%d).sql
```

生成的 `.sql` 文件可以恢复到任何 Postgres：

```bash
psql "<新数据库URL>" < backup-20260524.sql
```

**建议每月手动备份一次**，或者用 Neon 的 [Logical Replication](https://neon.tech/docs/guides/logical-replication-postgres) 实时备到另一个 Postgres。

### 6.2 图片备份

Vercel Blob 没有官方批量导出工具。手动备份方案：

1. 写个 Node 脚本调 `@vercel/blob` 的 `list()` API 拿到所有 blob URL
2. 用 `curl` / `fetch` 批量下载到本地
3. 同步到云盘或自建 NAS

或者，**逐步迁移**到自己的对象存储（如阿里云 OSS）并改代码里的上传逻辑。

### 6.3 内容导出

如果以后想离开 Hypervoid，可以用一个简单 SQL 把数据库里的所有文章导出成 Markdown：

```sql
SELECT slug, title, content, created_at FROM posts WHERE status = 'published';
```

把结果保存到 CSV → 用脚本拆成 `.mdx` 文件 → 推到任何静态站生成器（Astro / Hugo / Jekyll）。

---

## 七、故障排查

### 7.1 部署失败

**症状：** Vercel Dashboard 显示红色 Failed。

**排查：**

1. 进入失败的部署 → 看 Build Logs
2. 常见原因：
   - **TypeScript 错误** —— 本地跑 `pnpm tsc --noEmit` 复现
   - **缺环境变量** —— 看错误日志里的 `process.env.XXX is not defined`
   - **OOM**（Out of Memory）—— Vercel Hobby 内存有限。简化导入图大小或加 `NODE_OPTIONS="--max-old-space-size=4096"`
   - **数据库连接失败** —— 检查 `DATABASE_URL` 是不是被改过

### 7.2 评论加载不出

**症状：** 文章底部 Giscus 区域转圈不出来。

**排查：**

1. 浏览器 F12 → Console，看有没有 4xx 错误
2. 确认 4 个 `NEXT_PUBLIC_GISCUS_*` 环境变量在 Vercel 上**没有尾部空格**（Vercel UI 历史问题）
3. 改完后必须 **No-Cache Redeploy**
4. 确认仓库的 Discussions 功能已开启 + Giscus app 已授权

### 7.3 搜索没结果 / 数据库连接超时

**搜索没结果（用户输入了关键词但 0 篇文章）：**

- 99% 是 pg_trgm 索引丢了。重新跑：
  ```bash
  pnpm exec tsx scripts/setup-search.ts
  ```

**数据库连接超时：**

- Neon 免费版有 5 分钟无连接休眠机制。冷启动第一次请求会慢 1-3 秒
- 如果一直连不上：检查 Neon 控制台项目是否暂停（流量超限或被手动停了）

### 7.4 DNS 不生效

参见 [5.2](#52-自定义域名) 的 "DNS 验证可能有 negative-cache"。**永远先用 Google DoH 确认 DNS 真实状态**：

```bash
curl -s 'https://dns.google/resolve?name=<域名>&type=A' | python3 -m json.tool
curl -s 'https://dns.google/resolve?name=<域名>&type=TXT' | python3 -m json.tool
```

如果 DoH 看到的是对的，但 Vercel 仍说 "Verification Needed"，**就是它的负缓存**，多点 Refresh 或等 15 分钟。

### 7.5 邮件发不出去

**症状：** 用户订阅没收到确认邮件 / 新文章发布没邮件通知。

**排查：**

1. Resend Dashboard → Logs → 看最近的发送记录和状态
2. 常见原因：
   - **环境变量没设** —— 检查 `RESEND_API_KEY`
   - **API key 没权限** —— Resend 有 "send-only" / "full access" 两种 key。订阅邮件用 send-only 就行
   - **被收件人 spam folder 拦了** —— 测试时记得翻垃圾箱
   - **每天 100 封免费配额用完了**（用 `onboarding@resend.dev` 发件人时）—— 升级到自定义域名后配额会变大

### 7.6 AI 摘要 / Q&A 报错

**症状：** 后台点「生成 AI 摘要」按钮没反应或报错。

**排查：**

1. 检查 `ANTHROPIC_API_KEY` 是否设了，是不是过期了
2. Anthropic Console（https://console.anthropic.com）看用量页，是不是欠费了
3. 文章太长（> 100K tokens）会被截断或报错——把内容控制在合理长度

---

## 八、成本与监控

### 8.1 各服务免费配额

| 服务 | 免费档 | 估计够用多久 |
|---|---|---|
| Neon Postgres | 0.5 GB 存储 / 3.5 GB 出站流量/月 | 数千篇文章 / 万级 PV/月 |
| Vercel Hobby | 100 GB 出站 / 6000 build minutes/月 | 万级 PV/月 |
| Vercel Blob | 1 GB 存储 / 100K/月 ops | 几百张图 |
| Resend | 100 封邮件/天（用沙箱发件人）/ 3000/月（自定义域名） | 几百订阅 |
| Umami Cloud | 10K events/月 | 中等流量 |
| Anthropic | 按用量付费 | — |
| Giscus | 无限制 | — |
| GitHub | 公共仓库免费 | — |

### 8.2 AI 调用成本估算

**Claude Haiku 4.5 价格**（截至 2026 年）：
- Input: $1 / 1M tokens
- Output: $5 / 1M tokens

**单次操作粗估：**

| 操作 | 输入 tokens | 输出 tokens | 单次成本 |
|---|---|---|---|
| AI 摘要（2000 字文章） | ~3000 | ~200 | ~¥0.015 |
| AI Q&A 单轮（带文章 context） | ~4000 | ~500 | ~¥0.03 |

**每月 100 次 Q&A + 5 次摘要 ≈ ¥3.1**。极低，不需要太担心。

### 8.3 监控告警

**Vercel** —— 自动通过邮件通知部署失败。

**Neon** —— 储存/流量超 80% 配额会邮件告警。

**Anthropic** —— Console 里能设余额预警。

**自定义告警** —— 如果想搞，可以加一个 GitHub Actions 定时 ping `/api/health`（需要先实现这个路由），失败发企业微信/钉钉/邮件。这部分暂未实现。

---

## 九、扩展开发

### 9.1 加新页面

**静态页面**（如 `/contact`）：

1. 创建 `src/app/contact/page.tsx`
2. 导出 default function 返回 JSX
3. （可选）export `metadata` 设置标题描述
4. 加到导航（[4.3](#43-导航菜单)）和翻译（`src/lib/i18n.ts`）

**带数据的页面**（如 `/books`，从数据库读）：

1. 在 `src/db/schema.ts` 加 `books` 表
2. `pnpm db:generate && pnpm db:push`
3. 在 `src/lib/` 写查询函数（参考 `posts.ts`）
4. 在 `src/app/books/page.tsx` 用 `async function` 调用查询
5. 后台管理：参考 `src/app/admin/posts/` 复制一份

### 9.2 加新组件

放 `src/components/`，文件名 PascalCase 跟组件名一致。组件该是 server 还是 client：

- **Server**（默认）—— 只渲染、能直接 await 数据库
- **Client**（顶部加 `"use client"`）—— 需要交互、useState、useEffect、event listener

### 9.3 加新 API 路由

`src/app/api/<路径>/route.ts`，导出 `GET` / `POST` 等异步函数。例子：

```ts
// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", ts: Date.now() });
}
```

部署后 `https://hypervoid.top/api/health` 可访问。

需要 admin 鉴权的接口：

```ts
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.name !== process.env.ADMIN_GITHUB_LOGIN) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ...
}
```

### 9.4 升级依赖

```bash
pnpm outdated         # 看哪些过时
pnpm up --latest      # 升级所有到 latest（小心 major 升级有 breaking change）
pnpm up <pkg>@latest  # 单独升级一个
```

**升级 Next 是大事**——AGENTS.md 提醒过：「This is NOT the Next.js you know」。Next 16 → 17 之类的 major 升级，必须读完官方迁移指南再动。

---

## 十、版本管理与协作

### 10.1 Git 工作流

**单人开发，简单线性：**

```bash
git pull              # 同步远程
# 改代码
pnpm tsc --noEmit     # 类型检查
git add <files>
git commit -m "..."
git push              # 触发 Vercel 自动部署
```

**Commit message 风格**（仓库已有）：

```
posts: prev/next navigation at article bottom
codeblock: filename header + copy button + language label
ux: cmd+k search shortcut, back-to-top button, search autofocus
```

格式：`<scope>: <action>`，scope 是模块名（posts、codeblock、ux、config 等），动作是动词+宾语，简洁。

### 10.2 Preview Deployment

默认开启。任何非 main 分支 push 会自动生成 preview URL。适合：

- 改大功能（搜索算法、AI prompt 调优）想线上测
- 改样式想多人看效果

```bash
git checkout -b ui-experiment
# 改代码
git push -u origin ui-experiment
```

→ Vercel 返回类似 `hypervoid-git-ui-experiment-charon.vercel.app` 的 URL。

### 10.3 回滚部署

**情况 1：刚发现新版本有 bug，想立刻回退**：

Vercel Dashboard → Deployments → 找上一个绿色 Production → ⋯ → "Promote to Production"。

**情况 2：错误代码已经 push 到 main**：

```bash
git revert HEAD       # 反向提交一个 commit
git push              # 触发新部署
```

不要 `git reset --hard + git push -f` 到 main——会丢历史。

---

## 附录

### A. 环境变量索引（按字母）

| 变量名 | 必填 | 用途 | 改了要重部署吗 |
|---|---|---|---|
| `ADMIN_GITHUB_LOGIN` | ✓ | 后台允许的唯一 GitHub 用户名 | 否（运行时读） |
| `ANTHROPIC_API_KEY` | 建议 | AI 摘要 / Q&A | 否 |
| `AUTH_GITHUB_ID` | ✓ | GitHub OAuth Client ID | 否 |
| `AUTH_GITHUB_SECRET` | ✓ | GitHub OAuth Client Secret | 否 |
| `AUTH_SECRET` | ✓ | 加密 session 的密钥（>= 32 字节 base64） | 否 |
| `BLOB_READ_WRITE_TOKEN` | ✓ | Vercel Blob 读写 | 否 |
| `CRON_SECRET` | 可选 | 设了之后 cron 路由要带 Bearer 鉴权 | 否 |
| `DATABASE_URL` | ✓ | Neon Postgres 连接串 | 否 |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | ✓ | Giscus 讨论分类名 | **是** |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | ✓ | Giscus 分类 ID | **是** |
| `NEXT_PUBLIC_GISCUS_REPO` | ✓ | Giscus 仓库名 | **是** |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | ✓ | Giscus 仓库 ID | **是** |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL` | 可选 | 自建 Umami 时填 | **是** |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | 建议 | Umami 站点 ID | **是** |
| `RESEND_API_KEY` | 建议 | 邮件发送 | 否 |
| `RESEND_FROM_EMAIL` | 建议 | 邮件发件人 | 否 |
| `RESEND_FROM_NAME` | 建议 | 邮件发件人显示名 | 否 |

"改了要重部署吗 = 是" 的变量必须做 **No-Cache Redeploy**（[5.3](#53-环境变量更新)）。

### B. 命令速查

```bash
# 开发
pnpm dev                                          # 开发模式
pnpm build && pnpm start                          # 生产预览
pnpm tsc --noEmit                                 # 类型检查

# 数据库
pnpm db:generate                                  # 生成迁移 SQL
pnpm db:push                                      # 推 schema（开发用）
pnpm db:studio                                    # 可视化界面
pnpm exec tsx scripts/setup-search.ts             # 重建搜索索引（push 后必跑）

# Git
git push                                          # 触发 Vercel 自动部署
git commit --allow-empty -m "trigger redeploy"    # 不改代码强制重部署
git push origin HEAD:experiment                   # 推到 preview 分支

# DNS 验证（绕过本地 ISP 污染）
curl -s 'https://dns.google/resolve?name=<域名>&type=A' | python3 -m json.tool

# 数据库备份
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

### C. 关键文件位置

| 想改的东西 | 编辑这个文件 |
|---|---|
| 站点名 / URL / 作者 / 社交链接 / 建站日期 / Bangumi 用户 | `src/lib/site-config.ts` |
| 导航菜单（桌面+移动） | `src/components/NavGroups.tsx` + `src/components/MobileNav.tsx` |
| 中英文翻译 | `src/lib/i18n.ts` |
| 主题色板（基础色 light/dark） | `src/app/globals.css` 的 `:root` / `.dark` 块 |
| 站点设置面板（调色板 / 背景 / 字体） | `src/components/SettingsProvider.tsx` + `SiteSettings.tsx` + `Backdrop.tsx` |
| 阅读模式样式 | `src/app/globals.css` 的 `[data-reading]` 规则 + `src/components/ReadingMode.tsx` |
| 网站图标 favicon | `src/app/icon.svg` |
| About 页内容 | `src/app/about/page.tsx` |
| 数据库表结构 | `src/db/schema.ts` |
| 文章查询逻辑 | `src/lib/posts.ts` |
| 首页布局 | `src/app/page.tsx` |
| 文章详情页 | `src/app/posts/[slug]/page.tsx` |
| Shiki 代码块装饰 | `src/lib/shiki-meta.ts` + `src/components/CodeBlock.tsx` |
| AI 调用逻辑 | `src/lib/ai.ts` |
| 邮件模板 | `src/lib/newsletter.ts` + `src/app/api/subscribe/route.ts` |
| Cron 任务 | `src/app/api/cron/publish-scheduled/route.ts` + `vercel.json` |
| Bangumi 集成 | `src/lib/bangumi.ts` + `src/app/api/bangumi/subject/[id]/route.ts` + `src/components/AnimeGrid.tsx` + `AnimeDetailModal.tsx` |
| 文章页阅读体验组件 | `ReadingProgress.tsx` · `ReadingMode.tsx` · `ShareButtons.tsx` · `PostNav.tsx` |
| 列表布局工具 | `src/components/ColumnLayout.tsx` (hook + 切换按钮) · `PostsGrid.tsx` · `ArchiveLayout.tsx` |

### D. 常用外部链接

- **生产站点**：https://hypervoid.top
- **GitHub 仓库**：https://github.com/HyperCharon/hypervoid
- **Vercel 项目**：https://vercel.com/dashboard（登录后找 hypervoid 项目）
- **Neon 数据库**：https://console.neon.tech
- **Resend**：https://resend.com
- **Umami Cloud**：https://cloud.umami.is
- **Anthropic Console**：https://console.anthropic.com
- **GitHub OAuth Apps**：https://github.com/settings/developers
- **阿里云 DNS**：https://dns.console.aliyun.com
- **Giscus 配置生成器**：https://giscus.app

---

**就这些。** 这份手册随项目演进会落后——觉得哪里跟实际不一致了直接来改。
