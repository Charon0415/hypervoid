import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "赞赏",
  description: "如果觉得 Hypervoid 有用，可以请作者喝杯咖啡",
};

function qrExists(image: string): boolean {
  if (!image.startsWith("/")) return true;
  try {
    return existsSync(path.join(process.cwd(), "public", image.slice(1)));
  } catch {
    return false;
  }
}

export default function DonatePage() {
  const { donate, author } = siteConfig;
  if (!donate.enabled) notFound();
  const availableQrs = donate.qrcodes.filter((q) => qrExists(q.image));
  const hasLinks = donate.links.length > 0;
  const isEmpty = availableQrs.length === 0 && !hasLinks;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-widest text-primary">
          Support · 赞赏
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          请{author.name}喝杯咖啡 ☕
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {donate.intro}
        </p>
      </header>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          <p>赞赏功能尚未配置。需要：</p>
          <ul className="mx-auto mt-3 max-w-md text-left text-xs">
            <li>
              · 把微信 / 支付宝 收款码图片放到{" "}
              <code className="rounded bg-card px-1.5 py-0.5">
                public/donate/wechat.jpg
              </code>{" "}
              和 <code className="rounded bg-card px-1.5 py-0.5">alipay.jpg</code>
            </li>
            <li>
              · 或在{" "}
              <code className="rounded bg-card px-1.5 py-0.5">
                src/lib/site-config.ts
              </code>{" "}
              的 <code>donate.links</code> 里取消注释你想用的外部渠道
            </li>
          </ul>
        </div>
      ) : null}

      {availableQrs.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2">
          {availableQrs.map((q) => (
            <div
              key={q.name}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-sm font-medium text-muted">{q.name}</p>
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.image}
                  alt={`${q.name} 收款码`}
                  className="h-56 w-56 object-contain"
                />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {hasLinks ? (
        <section className="flex flex-col gap-3">
          <p className="text-center text-xs uppercase tracking-widest text-muted">
            或通过这些平台
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {donate.links.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                {l.name}
                <svg
                  aria-hidden
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H8M17 7v9" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex flex-col items-center gap-3 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted">
          所有赞赏自愿，不影响任何内容访问。无论你赞赏与否，文章都对你完全开放。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          回首页
        </Link>
      </div>
    </div>
  );
}
