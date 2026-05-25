import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listAllWebmentions } from "@/lib/webmentions";
import { formatDateTimeCN } from "@/lib/datetime";
import { deleteAction, toggleHiddenAction } from "./actions";

export const metadata: Metadata = {
  title: "Webmention 审核",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function hostnameOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "verified":
      return (
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
          已验证
        </span>
      );
    case "pending":
      return (
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
          待验证
        </span>
      );
    case "rejected":
      return (
        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-300">
          已拒绝
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-medium text-muted">
          {status}
        </span>
      );
  }
}

export default async function AdminWebmentionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const list = await listAllWebmentions();

  const stats = {
    verified: list.filter((w) => w.status === "verified" && !w.hidden).length,
    hidden: list.filter((w) => w.hidden).length,
    pending: list.filter((w) => w.status === "pending").length,
    rejected: list.filter((w) => w.status === "rejected").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">Webmention 审核</h1>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="已验证可见" value={stats.verified} />
        <Stat label="隐藏" value={stats.hidden} />
        <Stat label="待验证" value={stats.pending} />
        <Stat label="已拒绝" value={stats.rejected} />
      </section>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有 Webmention 进来。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((w) => (
            <li
              key={w.id}
              className={`rounded-xl border border-border bg-card p-4 ${
                w.hidden ? "opacity-60" : ""
              }`}
            >
              <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {statusBadge(w.status)}
                  {w.hidden ? (
                    <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px] text-muted">
                      已隐藏
                    </span>
                  ) : null}
                  <span className="font-mono text-[10px] text-muted">
                    {formatDateTimeCN(w.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await toggleHiddenAction(w.id, !w.hidden);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] text-muted transition hover:border-primary hover:text-foreground"
                    >
                      {w.hidden ? "显示" : "隐藏"}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteAction(w.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                    >
                      删除
                    </button>
                  </form>
                </div>
              </header>

              <p className="text-sm">
                <span className="text-muted">来源：</span>
                <a
                  href={w.source}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  className="break-all hover:text-primary"
                >
                  {w.source}
                </a>{" "}
                <span className="text-[10px] text-muted">
                  ({hostnameOf(w.source)})
                </span>
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted">目标：</span>
                <a
                  href={`/posts/${w.targetSlug ?? ""}`}
                  className="break-all hover:text-primary"
                >
                  /posts/{w.targetSlug ?? "?"}
                </a>
              </p>
              {w.authorName ? (
                <p className="mt-1 text-xs text-muted">
                  作者：{w.authorName}
                </p>
              ) : null}
              {w.content ? (
                <p className="mt-2 line-clamp-3 text-xs text-foreground/80">
                  {w.content}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold leading-tight">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
