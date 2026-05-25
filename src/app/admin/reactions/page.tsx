import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listAllPostReactions } from "@/lib/reactions";
import { REACTION_EMOJIS } from "@/lib/reactions-shared";

export const metadata: Metadata = {
  title: "反应数据",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminReactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const rows = await listAllPostReactions();

  const totals = REACTION_EMOJIS.reduce<Record<string, number>>((acc, e) => {
    acc[e.key] = 0;
    return acc;
  }, {});
  for (const r of rows) {
    for (const e of REACTION_EMOJIS) {
      totals[e.key] += r.counts[e.key] ?? 0;
    }
  }
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">反应数据</h1>
        <span className="text-sm text-muted">
          共 {grandTotal} 次反应 · 涉及 {rows.length} 篇
        </span>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {REACTION_EMOJIS.map((e) => (
          <div
            key={e.key}
            className="rounded-2xl border border-border bg-card p-4 text-center"
          >
            <p className="text-2xl leading-none">{e.glyph}</p>
            <p className="mt-1 font-mono text-xl font-bold leading-tight">
              {totals[e.key].toLocaleString("en-US")}
            </p>
            <p className="text-[11px] text-muted">{e.label}</p>
          </div>
        ))}
      </section>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有反应数据。
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-card text-left">
              <tr>
                <th className="px-4 py-3 font-medium">文章</th>
                {REACTION_EMOJIS.map((e) => (
                  <th
                    key={e.key}
                    className="px-2 py-3 text-center font-medium"
                    title={e.label}
                  >
                    {e.glyph}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">合计</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-t border-border bg-background">
                  <td className="max-w-[20rem] px-4 py-2 truncate">
                    <Link
                      href={`/posts/${r.slug}`}
                      className="font-medium hover:text-primary"
                      title={r.title}
                    >
                      {r.title}
                    </Link>
                  </td>
                  {REACTION_EMOJIS.map((e) => (
                    <td
                      key={e.key}
                      className="px-2 py-2 text-center font-mono text-xs text-muted"
                    >
                      {r.counts[e.key] || ""}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-mono text-sm font-medium">
                    {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
