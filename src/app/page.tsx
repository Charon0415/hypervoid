import { Suspense } from "react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { FeaturedPostCard } from "@/components/FeaturedPostCard";
import { StaggerReveal } from "@/components/StaggerReveal";
import { SubscribeForm } from "@/components/SubscribeForm";
import { RssSubscribeCard } from "@/components/RssSubscribeCard";
import { isEmailConfigured } from "@/lib/email";
import { SiteStats } from "@/components/SiteStats";
import { AnnouncementWidget } from "@/components/AnnouncementWidget";
import { ProfileCard } from "@/components/ProfileCard";
import { MiniCalendar } from "@/components/MiniCalendar";
import { MiniTerminal } from "@/components/MiniTerminal";
import { PostActivityHeatmap } from "@/components/PostActivityHeatmap";
import { TopicCollections } from "@/components/TopicCollections";
import { TagCloud } from "@/components/TagCloud";
import { RecentGuestbook } from "@/components/RecentGuestbook";
import { PrivateSpace } from "@/components/PrivateSpace";
import { HeroSection } from "@/components/HeroSection";
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
    <>
      {/* ═══ HERO ═══ */}
      <HeroSection
        quote={quote}
        quoteAuthor={quoteAuthor}
        marqueeItems={[
          "Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Drizzle ORM",
          "Neon Postgres", "Vercel", "Auth.js", "Giscus", "Umami",
          "DeepSeek", "Claude", "Live2D", "Sci-Fi HUD",
        ]}
      />

      {/* ═══ MAIN + SIDEBAR ═══ */}
      <div className="mt-8 w-full px-4 sm:px-6 lg:px-8 lg:mt-12">
      <div className="mx-auto grid max-w-[100rem] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <main className="flex flex-col gap-8 lg:order-1">

          {/* ── Daily Pick — floating card ── */}
          {dailyPick ? (
            <div className="-mt-4 lg:-mt-6">
              <DailyPick post={dailyPick} />
            </div>
          ) : null}

          {/* ── Topic Series — breakout bento ── */}
          <div className="-mx-4 sm:-mx-6 md:-mx-8">
            <div className="px-4 sm:px-6 md:px-8">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <TopicCollections />
              </Suspense>
            </div>
          </div>

          {/* ── Activity Heatmap ── */}
          <PostActivityHeatmap />

          {/* ── Posts Section ── */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-accent/25 bg-card text-accent-soft">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                  </svg>
                </div>
                <h2 className="bg-gradient-to-r from-accent-soft via-accent-soft to-accent-soft bg-clip-text font-mono text-xl font-bold uppercase tracking-tight text-transparent sm:text-2xl">
                  Latest_Posts
                </h2>
              </div>
              <Link
                href="/posts"
                className="group inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-card px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-accent-soft transition hover:border-accent/40 hover:bg-card-hover hover:text-accent-soft"
              >
                View_All
                <svg aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {recent.length ? (
              <div className="flex flex-col gap-5">
                {/* Featured post — full width */}
                <FeaturedPostCard post={recent[0]} />

                {/* Remaining posts — staggered reveal */}
                {recent.length > 1 ? (
                  <StaggerReveal className="grid gap-4 sm:grid-cols-2">
                    {recent.slice(1).map((post, i) => (
                      <div key={post.slug} className={i === 0 ? "sm:col-span-2" : ""}>
                        <PostCard post={post} />
                      </div>
                    ))}
                  </StaggerReveal>
                ) : null}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-accent/20 p-10 text-center font-mono text-sm text-muted">
                还没有文章。
              </p>
            )}
          </section>

          {/* ── Subscribe — gradient band ── */}
          <section className="relative overflow-hidden rounded-2xl py-8 px-6 backdrop-blur-2xl sm:px-10"
            style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.1), rgba(249,115,22,0.08), rgba(234,179,8,0.07), rgba(34,197,94,0.08), rgba(6,182,212,0.1), rgba(59,130,246,0.12), rgba(99,102,241,0.1), rgba(139,92,246,0.09), rgba(217,70,239,0.08), rgba(12,18,36,0.82))", border: "1px solid rgba(255,255,255,0.1)", WebkitBackdropFilter: "blur(40px) saturate(1.6)" }}>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "var(--rainbow)", opacity: 0.4 }} />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: "var(--rainbow)", opacity: 0.3 }} />
            <div className="mx-auto max-w-2xl">
              {isEmailConfigured() ? <SubscribeForm /> : <RssSubscribeCard />}
            </div>
          </section>
        </main>

        {/* ═══ SIDEBAR — staggered, varied spacing ═══ */}
        <aside className="lg:order-2">
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
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
      </div>
    </>
  );
}
