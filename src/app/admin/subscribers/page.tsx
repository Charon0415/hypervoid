import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getSubscriberStats, listAllSubscribers } from "@/db/subscribers";
import { formatDateTimeCN } from "@/lib/datetime";
import {
  deleteAction,
  restoreAction,
  unsubscribeAction,
} from "./actions";

export const metadata: Metadata = {
  title: "订阅者管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function statusOf(sub: {
  verified: boolean;
  unsubscribedAt: Date | null;
}): {
  label: string;
  cls: string;
} {
  if (sub.unsubscribedAt) {
    return {
      label: "已退订",
      cls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
    };
  }
  if (sub.verified) {
    return {
      label: "已确认",
      cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }
  return {
    label: "待确认",
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
}

export default async function AdminSubscribersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const [subs, stats] = await Promise.all([
    listAllSubscribers(),
    getSubscriberStats(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">订阅者管理</h1>
        </div>
      </header>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <StatTile label="总数" value={stats.total} />
        <StatTile label="已确认" value={stats.verified} accent="emerald" />
        <StatTile label="待确认" value={stats.pending} accent="amber" />
        <StatTile label="已退订" value={stats.unsubscribed} />
      </section>

      {subs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有订阅者。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">订阅时间</th>
                <th className="px-4 py-3 font-medium">确认时间</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const s = statusOf(sub);
                return (
                  <tr
                    key={sub.id}
                    className="border-t border-border bg-background"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${s.cls}`}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDateTimeCN(sub.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {sub.verifiedAt ? formatDateTimeCN(sub.verifiedAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {sub.unsubscribedAt ? (
                          <form
                            action={async () => {
                              "use server";
                              await restoreAction(sub.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] transition hover:border-primary hover:text-primary"
                            >
                              恢复
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              "use server";
                              await unsubscribeAction(sub.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] transition hover:border-amber-500 hover:text-amber-600"
                            >
                              退订
                            </button>
                          </form>
                        )}
                        <form
                          action={async () => {
                            "use server";
                            await deleteAction(sub.id);
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted">
        提示：「退订」可恢复，「删除」彻底从数据库移除（用户后续可重新订阅）。
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-2xl font-bold leading-tight sm:text-3xl ${accentClass}`}
      >
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
