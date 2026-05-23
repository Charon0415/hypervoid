import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SiteStats } from "@/components/SiteStats";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function Home() {
  const recent = (await getAllPosts()).slice(0, 4);

  return (
    <div className="flex flex-col gap-12">
      <section className="hypervoid-hero relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12">
        <div aria-hidden className="hypervoid-stars" />
        <div className="relative">
          <p className="text-sm uppercase tracking-widest text-primary">
            Hypervoid · 超虚空
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            你好，我是 Charon。
          </h1>
          <p className="mt-3 font-mono text-sm italic text-muted sm:text-base">
            The world is big, you have to go and see.
          </p>
          <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">
            这里是 Hypervoid——hyper + void，自造词，意思是「超虚空」。
            一颗游荡者留下的坐标：写技术、玩游戏、追番剧、记录折腾——
            能记录的都记录在这。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/posts"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              阅读文章 →
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              关于我
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              归档
            </Link>
          </div>
        </div>
      </section>

      <SiteStats />

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">最新文章</h2>
          <Link
            href="/posts"
            className="text-sm text-muted hover:text-primary"
          >
            全部 →
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

      <section>
        <SubscribeForm />
      </section>
    </div>
  );
}
