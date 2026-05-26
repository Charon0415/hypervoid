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
import { PopularPosts } from "@/components/PopularPosts";
import { TagCloud } from "@/components/TagCloud";
import { RecentGuestbook } from "@/components/RecentGuestbook";
import { Greeting } from "@/components/Greeting";
import { DailyPick } from "@/components/DailyPick";
import { getAllPostMeta } from "@/lib/posts";
import { getSiteOverride } from "@/lib/site-config-server";

export const revalidate = 60;

function pickByDay<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const day = Math.floor(Date.now() / 86_400_000);
  return arr[day % arr.length];
}

export default async function Home() {
  const [all, quote, quoteAuthor] = await Promise.all([
    getAllPostMeta(),
    getSiteOverride("home.quote"),
    getSiteOverride("home.quoteAuthor"),
  ]);
  const recent = all.slice(0, 10);
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
      <div className="flex flex-col gap-10 lg:order-1">
        <section className="hypervoid-hero relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 md:p-12">
          <div aria-hidden className="hypervoid-stars" />
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-primary sm:text-sm">
              Hypervoid · 高维虚空
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:mt-3 sm:text-4xl md:text-5xl">
              <Greeting name="Charon" />
            </h1>
            <p className="mt-2 font-mono text-xs italic text-muted sm:mt-3 sm:text-sm md:text-base">
              The world is big, you have to go and see.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:mt-5 sm:text-base md:text-lg">
              <span className="text-foreground/80">「{quote}」</span>
              {quoteAuthor ? (
                <span className="ml-2 text-xs text-muted/80 sm:text-sm">
                  —— {quoteAuthor}
                </span>
              ) : null}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
              >
                阅读文章
                <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                关于我
              </Link>
              <Link
                href="/archive"
                className="inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                归档
              </Link>
            </div>
          </div>
        </section>

        {dailyPick ? <DailyPick post={dailyPick} /> : null}

        <PostActivityHeatmap />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              最新文章
            </h2>
            <Link
              href="/posts"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              全部
              <svg aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recent.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
              还没有文章。
            </p>
          )}
        </section>

        <section className="lg:mt-auto">
          {isEmailConfigured() ? <SubscribeForm /> : <RssSubscribeCard />}
        </section>
      </div>

      <aside className="lg:order-2">
        <div className="flex flex-col gap-6 lg:sticky lg:top-20">
          <ProfileCard />
          <SiteStats />
          <AnnouncementWidget />
          <div className="hidden lg:block">
            <MiniTerminal posts={terminalPosts} tags={terminalTags} me={null} />
          </div>
          <div className="hidden md:contents">
            <MiniCalendar />
          </div>
          <PopularPosts />
          <div className="hidden md:contents">
            <TagCloud />
          </div>
          <RecentGuestbook />
        </div>
      </aside>
    </div>
  );
}
