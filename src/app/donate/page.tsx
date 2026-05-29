import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowLeft, ExternalLink, HeartHandshake } from "lucide-react";
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
      <header className="hv-panel relative overflow-hidden p-5 text-center sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker justify-center">Support channel / voluntary signal</p>
        <h1 className="hv-title mt-2 flex items-center justify-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
          <HeartHandshake className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
          支持 {author.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-cyan-50/62 sm:text-base">
          {donate.intro}
        </p>
      </header>

      {isEmpty ? (
        <div className="hv-panel border-dashed p-8 text-center text-sm text-cyan-50/60">
          <p>赞赏功能尚未配置。需要：</p>
          <ul className="mx-auto mt-3 max-w-md text-left text-xs leading-6">
            <li>
              / 把微信 / 支付宝 收款码图片放到{" "}
              <code className="border border-cyan-100/14 bg-white/[0.055] px-1.5 py-0.5 text-cyan-100">
                public/donate/wechat.jpg
              </code>{" "}
              和 <code className="border border-cyan-100/14 bg-white/[0.055] px-1.5 py-0.5 text-cyan-100">alipay.jpg</code>
            </li>
            <li>
              / 或在{" "}
              <code className="border border-cyan-100/14 bg-white/[0.055] px-1.5 py-0.5 text-cyan-100">
                src/lib/site-config.ts
              </code>{" "}
              的 <code>donate.links</code> 里取消注释外部渠道
            </li>
          </ul>
        </div>
      ) : null}

      {availableQrs.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2">
          {availableQrs.map((q) => (
            <div key={q.name} className="hv-panel flex flex-col items-center gap-3 p-6">
              <p className="hv-kicker">{q.name}</p>
              <div className="overflow-hidden border border-cyan-100/16 bg-white/[0.045] p-2">
                <Image
                  src={q.image}
                  alt={q.name + " 收款码"}
                  width={448}
                  height={448}
                  sizes="224px"
                  className="h-56 w-56 object-contain"
                />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {hasLinks ? (
        <section className="flex flex-col gap-3">
          <p className="hv-kicker justify-center text-center">External support links</p>
          <div className="flex flex-wrap justify-center gap-3">
            {donate.links.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="hv-action px-5 py-2.5 text-sm font-medium"
              >
                {l.name}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex flex-col items-center gap-3 border-t border-cyan-100/12 pt-6 text-center">
        <p className="text-xs text-cyan-50/55">
          所有赞赏自愿，不影响任何内容访问。无论你赞赏与否，文章都对你完全开放。
        </p>
        <Link href="/" className="hv-action px-4 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          回首页
        </Link>
      </div>
    </div>
  );
}
