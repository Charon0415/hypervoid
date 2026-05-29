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
      cls: "border-zinc-400/30 bg-zinc-400/10 text-zinc-200",
    };
  }
  if (sub.verified) {
    return {
      label: "已确认",
      cls: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
    };
  }
  return {
    label: "待确认",
    cls: "border-amber-400/35 bg-amber-400/10 text-amber-200",
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
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Subscriber Relay</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">订阅者管理</h1>
          </div>
        </div>
        <p className="max-w-xl text-sm text-muted">
          维护邮件订阅状态。退订可恢复，删除会从数据库移除，但用户后续仍可重新订阅。
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="总数" value={stats.total} />
        <StatTile label="已确认" value={stats.verified} accent="emerald" />
        <StatTile label="待确认" value={stats.pending} accent="amber" />
        <StatTile label="已退订" value={stats.unsubscribed} />
      </section>

      {subs.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有订阅者。
        </p>
      ) : (
        <div className="hv-panel overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-cyan-200/10 bg-cyan-300/[0.04] text-left text-xs uppercase text-cyan-100/65">
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
                    className="border-t border-cyan-200/10 transition hover:bg-cyan-300/[0.035]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-cyan-50/85">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex border px-2 py-0.5 font-mono text-[11px] " + s.cls}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {formatDateTimeCN(sub.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
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
                            <button type="submit" className="hv-action min-h-0 px-3 py-1 text-[11px]">
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
                            <button type="submit" className="hv-action min-h-0 px-3 py-1 text-[11px] hover:border-amber-300/60 hover:text-amber-100">
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
                          <button type="submit" className="min-h-0 border border-red-400/35 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 transition hover:border-red-300 hover:bg-red-500/15">
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
      ? "text-emerald-200"
      : accent === "amber"
        ? "text-amber-200"
        : "text-cyan-50";
  return (
    <div className="hv-panel p-4">
      <p className="hv-kicker">{label}</p>
      <p className={"mt-2 font-mono text-2xl font-semibold leading-tight sm:text-3xl " + accentClass}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
