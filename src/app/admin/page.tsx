import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth, signOut } from "@/auth";
import { listAllPosts } from "@/db/admin-posts";
import { countActiveSubscribers } from "@/lib/newsletter";
import { getSiteStats } from "@/lib/stats";
import { formatDateCN } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const login =
    (session.user as { login?: string }).login ?? session.user.name ?? "?";

  const [allPosts, subscriberCount, stats] = await Promise.all([
    listAllPosts(),
    countActiveSubscribers(),
    getSiteStats({ isAdmin: true }),
  ]);

  const drafts = allPosts.filter((p) => p.status === "draft");
  const scheduled = allPosts.filter(
    (p) => p.status === "scheduled" && p.publishAt && p.publishAt > new Date(),
  );
  const privateOnes = allPosts.filter((p) => p.visibility === "private");
  const missingSummary = allPosts.filter(
    (p) => p.status === "published" && !p.summary && p.content.length >= 200,
  );
  const recentPublished = allPosts
    .filter((p) => p.status === "published")
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
          <p className="mt-1 text-sm text-muted">
            登录身份：<span className="font-medium">@{login}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            + 新文章
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-primary hover:text-primary"
            >
              退出
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatCard label="已发布" value={stats.posts} hint="visible 文章" />
        <StatCard label="总浏览" value={stats.views} hint="累计 PV" />
        <StatCard label="总点赞" value={stats.likes} hint="累计 ♥" />
        <StatCard
          label="订阅者"
          value={subscriberCount}
          hint="已确认邮箱"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">
            最近 5 篇已发布
          </h2>
          {recentPublished.length === 0 ? (
            <p className="mt-3 text-sm text-muted">还没有已发布文章。</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {recentPublished.map((p) => (
                <li
                  key={p.slug}
                  className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 transition hover:bg-background"
                >
                  <Link
                    href={`/admin/posts/${p.slug}/edit`}
                    className="min-w-0 flex-1 truncate text-sm hover:text-primary"
                  >
                    {p.visibility === "private" ? (
                      <span className="mr-1" title="私密">
                        🔒
                      </span>
                    ) : null}
                    {p.title}
                  </Link>
                  <time className="shrink-0 font-mono text-[11px] text-muted">
                    {p.publishAt ? formatDateCN(p.publishAt) : "—"}
                  </time>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/posts"
            className="mt-3 inline-block text-xs text-primary hover:underline"
          >
            全部文章 →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <PendingCard
            label="草稿"
            count={drafts.length}
            href="/admin/posts"
            description="未发布的草稿"
          />
          <PendingCard
            label="定时待发"
            count={scheduled.length}
            href="/admin/posts"
            description="未到点的定时"
          />
          <PendingCard
            label="🔒 私密"
            count={privateOnes.length}
            href="/admin/posts"
            description="仅管理员可见"
          />
          {missingSummary.length > 0 ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                ⚠ {missingSummary.length} 篇已发布文章还没 AI 摘要
              </p>
              <p className="mt-1 text-muted">
                保存后会自动生成；老文章可去编辑页手动点「生成 AI 摘要」
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-muted">
          模块入口
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NavTile
            href="/admin/posts"
            title="文章管理"
            desc="创建、编辑、删除文章，草稿、定时发布"
            count={allPosts.length}
          />
          <NavTile
            href="/admin/stats"
            title="数据看板"
            desc="月度发文趋势、热门文章排行、累计指标"
          />
          <NavTile
            href="/admin/reactions"
            title="反应数据"
            desc="每篇文章 5 个 emoji 的反应数；找出最受欢迎的内容"
          />
          <NavTile
            href="/admin/notes"
            title="公告管理"
            desc="多位点公告 · 顶部条 / 侧边栏 / 文章顶部，带时间窗"
          />
          <NavTile
            href="/admin/redirects"
            title="短链管理"
            desc="/r/<码> 跳转 + 命中计数"
          />
          <NavTile
            href="/admin/webmentions"
            title="Webmention 审核"
            desc="外站引用的留痕，隐藏/删除可疑来源"
          />
          <NavTile
            href="/admin/resources"
            title="资源库"
            desc="收藏的链接、软件、工具，按分类分组展示在 /resources"
          />
          <NavTile
            href="/admin/media"
            title="图库管理"
            desc="查看 Vercel Blob 全部图片、复制URL、孤儿图清理"
          />
          <NavTile
            href="/admin/themes"
            title="主题定制"
            desc="调色板 + 实时预览 + JSON 主题包导入导出"
          />
          <NavTile
            href="/admin/ai"
            title="AI 配置"
            desc="切换 Claude 模型、查看 API Key 状态、影响摘要/标签/Q&A/康娜"
          />
          <NavTile
            href="/admin/guestbook"
            title="留言板管理"
            desc="审核访客留言：隐藏、恢复、删除"
          />
          <NavTile
            href="/admin/subscribers"
            title="订阅者管理"
            desc="查看邮箱订阅列表，手动退订/删除"
          />
          <NavTile
            href="/admin/friends"
            title="友链管理"
            desc="维护朋友的博客与个人站点链接"
          />
          <NavTile
            href="/admin/albums"
            title="相册管理"
            desc="创建相册、上传照片、添加说明"
          />
          <NavTile
            href="/admin/import"
            title="导入文章"
            desc="批量导入 Markdown 文件，自动解析 frontmatter"
          />
          <NavTile
            href="/admin/tags"
            title="标签管理"
            desc="跨文章重命名 / 合并 / 删除标签，一处生效全站"
          />
          <NavTile
            href="/admin/link-check"
            title="失效链接巡检"
            desc="扫描已发布文章外链，并标记 404 / 超时 / SSL 错误"
          />
          <NavTile
            href="/admin/search-log"
            title="搜索分析"
            desc="站内搜索查询 + 命中数；零结果查询单独高亮"
          />
          <NavTile
            href="/admin/backup"
            title="数据备份"
            desc="一键导出整库 JSON 到 Vercel Blob，下载或删除历史快照"
          />
          <NavTile
            href="/admin/audit"
            title="操作审计"
            desc="所有后台动作的只读时间线"
          />
          <NavTile
            href="/admin/settings"
            title="站点设置"
            desc="作者名、头像、简介、首页名句、公告——在线可改"
          />
        </div>
      </section>

      <p className="text-xs text-muted">
        ✦ 站点已运行 <span className="font-mono">{stats.daysOnline}</span> 天
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold leading-tight text-foreground sm:text-3xl">
        {value.toLocaleString("en-US")}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function PendingCard({
  label,
  count,
  href,
  description,
}: {
  label: string;
  count: number;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xs text-muted/70">{description}</p>
      </div>
      <span className="font-mono text-2xl font-bold text-foreground group-hover:text-primary">
        {count}
      </span>
    </Link>
  );
}

function NavTile({
  href,
  title,
  desc,
  count,
}: {
  href: string;
  title: string;
  desc: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold group-hover:text-primary">
          {title} →
        </h3>
        {count !== undefined ? (
          <span className="font-mono text-xs text-muted">{count}</span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </Link>
  );
}
