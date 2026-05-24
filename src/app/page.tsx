import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { ProfileCard } from "@/components/ProfileCard";
import { PostActivityHeatmap } from "@/components/PostActivityHeatmap";
import { PopularPosts } from "@/components/PopularPosts";
import { SidebarAccordion } from "@/components/SidebarAccordion";
import { Greeting } from "@/components/Greeting";
import { DailyPick } from "@/components/DailyPick";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 60;

function pickByDay<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const day = Math.floor(Date.now() / 86_400_000);
  return arr[day % arr.length];
}

export default async function Home() {
  const all = await getAllPosts();
  const recent = all.slice(0, 6);
  const dailyPick = pickByDay(all);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10">
      <div className="flex flex-col gap-6 lg:order-1">
        <section className="hypervoid-hero relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div aria-hidden className="hypervoid-stars" />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-xs uppercase tracking-widest text-primary">
                  ✦ Hypervoid
                </span>
                <span className="hidden text-xs text-muted sm:inline">
                  高维虚空
                </span>
              </div>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight sm:text-2xl">
                <Greeting name="Charon" />
                <span className="ml-1.5 font-mono text-xs font-normal italic text-muted">
                  · The world is big, you have to go and see.
                </span>
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href="/posts"
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:shadow-md sm:px-4 sm:py-2 sm:text-sm"
              >
                文章
                <svg aria-hidden className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
              >
                关于
              </Link>
            </div>
          </div>
        </section>

        {dailyPick ? <DailyPick post={dailyPick} /> : null}

        <PostActivityHeatmap />

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              最新文章
            </h2>
            <Link
              href="/posts"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary sm:px-4 sm:py-1.5 sm:text-sm"
            >
              全部
              <svg aria-hidden className="h-3 w-3 transition group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recent.length ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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

        <section>
          <SubscribeForm />
        </section>
      </div>

      <aside className="lg:order-2">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <ProfileCard />
          {/* Desktop: always visible */}
          <div className="hidden sm:block">
            <PopularPosts />
          </div>
          {/* Mobile: collapsible */}
          <div className="sm:hidden">
            <SidebarAccordion title="热门文章" defaultOpen={false}>
              <PopularPosts />
            </SidebarAccordion>
          </div>
        </div>
      </aside>
    </div>
  );
}
