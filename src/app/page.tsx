import { Suspense } from "react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { RssSubscribeCard } from "@/components/RssSubscribeCard";
import { isEmailConfigured } from "@/lib/email";
import { SiteStats } from "@/components/SiteStats";
import { AnnouncementWidget } from "@/components/AnnouncementWidget";
import { ProfileCard } from "@/components/ProfileCard";
import { MiniCalendar } from "@/components/MiniCalendar";
import { MiniTerminal } from "@/components/MiniTerminal";
import { PostActivityHeatmap } from "@/components/PostActivityHeatmap";
import { AdaptivePostGrid } from "@/components/AdaptivePostGrid";
import { TopicCollections } from "@/components/TopicCollections";
import { TagCloud } from "@/components/TagCloud";
import { RecentGuestbook } from "@/components/RecentGuestbook";
import { PrivateSpace } from "@/components/PrivateSpace";
import { Greeting } from "@/components/Greeting";
import { DailyPick } from "@/components/DailyPick";
import { HomePlayerWidget } from "@/components/HomePlayerWidget";
import { getAllPostMeta } from "@/lib/posts";
import { getSiteOverride } from "@/lib/site-config-server";
import { Skeleton } from "@/components/Skeleton";

export const revalidate = 60;

function pickByDay<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const day = Math.floor(Date.now() / 86_400_000);
  return arr[day % arr.length];
}

export default async function Home() {
  const [all, quote, quoteAuthor] = await Promise.all([
    getAllPostMeta().catch((error) => {
      console.warn("[home] failed to load posts:", error instanceof Error ? error.message : error);
      return [];
    }),
    getSiteOverride("home.quote"),
    getSiteOverride("home.quoteAuthor"),
  ]);
  const recent = all;
  const dailyPick = pickByDay(all);

  // Server-side snapshot for the MiniTerminal — only ships titles+slugs
  // for the latest 20 posts and top 10 tag counts to the client, so the
  // terminal can navigate without making its own API calls. We don't
  // call auth() here on purpose: this page is ISR (`revalidate = 60`),
  // and reading cookies would bust the static cache for every visitor.
  // The terminal's `whoami` falls back to "guest".
  const terminalPosts = all
    .slice(0, 20)
    .map((p) => ({ slug: p.slug, title: p.frontmatter.title }));
  const tagCounts = new Map<string, number>();
  for (const p of all) {
    for (const t of p.frontmatter.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const terminalTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="hv-home-grid grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
      <div className="hv-home-main flex flex-col gap-6 lg:order-1">
        <section className="hv-home-hero group relative overflow-hidden rounded-lg border border-cyan-100/16 bg-gradient-to-br from-cyan-950/36 via-slate-950/58 to-slate-950/78 p-4 sm:p-5 md:p-6">
          {/* Animated stars background */}
          <div aria-hidden className="hypervoid-stars" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-400 sm:text-sm">
                Hypervoid · 高维虚空
              </p>
            </div>
            <h1 className="mt-2 font-mono text-2xl font-bold uppercase tracking-tight text-cyan-50 sm:mt-3 sm:text-3xl md:text-4xl">
              <Greeting name="Charon" />
            </h1>
            <p className="mt-2 font-mono text-xs italic text-cyan-100/70 sm:text-sm">
              The world is big, you have to go and see.
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-cyan-400/40 via-cyan-400/20 to-transparent sm:mt-4" />
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cyan-50/78 sm:mt-4 sm:text-base">
              <span className="text-cyan-100">「{quote}」</span>
              {quoteAuthor ? (
                <span className="ml-2 text-xs text-cyan-50/60 sm:text-sm">
                  —— {quoteAuthor}
                </span>
              ) : null}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              <Link
                href="/posts"
                className="group inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wider text-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.15)] transition hover:border-cyan-400/60 hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[0_0_28px_rgba(103,232,249,0.25)]"
              >
                阅读文章
                <svg aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-md border border-cyan-100/18 bg-cyan-950/30 px-4 py-2 font-mono text-sm font-medium uppercase tracking-wider text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300"
              >
                关于我
              </Link>
              <Link
                href="/archive"
                className="inline-flex items-center rounded-md border border-cyan-100/18 bg-cyan-950/30 px-4 py-2 font-mono text-sm font-medium uppercase tracking-wider text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300"
              >
                归档
              </Link>
            </div>
          </div>
        </section>

        {dailyPick ? <DailyPick post={dailyPick} /> : null}

        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <TopicCollections />
        </Suspense>

        <PostActivityHeatmap />

        <div className="hv-home-posts">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md border border-cyan-400/30 bg-cyan-950/40 text-cyan-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                </svg>
              </div>
              <h2 className="font-mono text-lg font-bold uppercase tracking-tight text-cyan-50 sm:text-xl">
                Latest_Posts
              </h2>
            </div>
            <Link
              href="/posts"
              className="group inline-flex items-center gap-1.5 rounded-md border border-cyan-100/18 bg-cyan-950/30 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300"
            >
              View_All
              <svg aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recent.length ? (
            <AdaptivePostGrid>
              {recent.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </AdaptivePostGrid>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
              还没有文章。
            </p>
          )}
        </div>

        <section className="hv-home-subscribe">
          {isEmailConfigured() ? <SubscribeForm /> : <RssSubscribeCard />}
        </section>
      </div>

      <aside className="lg:order-2">
        <div className="hv-home-rail flex flex-col gap-4 lg:sticky lg:top-20">
          <PrivateSpace />
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <ProfileCard />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <SiteStats />
          </Suspense>
          <Suspense fallback={null}>
            <AnnouncementWidget />
          </Suspense>
          <div className="hidden lg:block">
            <MiniTerminal posts={terminalPosts} tags={terminalTags} me={null} />
          </div>
          <div className="hidden md:contents">
            <Suspense fallback={<Skeleton className="h-44 w-full" />}>
              <MiniCalendar />
            </Suspense>
          </div>
          <HomePlayerWidget />
          <div className="hidden md:contents">
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <TagCloud />
            </Suspense>
          </div>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <RecentGuestbook />
          </Suspense>
        </div>
      </aside>
    </div>
  );
}
