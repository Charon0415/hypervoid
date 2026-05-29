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
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Reaction Telemetry</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">反应数据</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="hv-chip">反应 {grandTotal}</span>
          <span className="hv-chip">文章 {rows.length}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {REACTION_EMOJIS.map((e) => (
          <div key={e.key} className="hv-panel p-4 text-center">
            <p className="text-2xl leading-none">{e.glyph}</p>
            <p className="mt-2 font-mono text-xl font-semibold leading-tight text-cyan-50">
              {totals[e.key].toLocaleString("en-US")}
            </p>
            <p className="text-[11px] text-muted">{e.label}</p>
          </div>
        ))}
      </section>

      {rows.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有反应数据。
        </p>
      ) : (
        <div className="hv-panel overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-cyan-200/10 bg-cyan-300/[0.04] text-left text-xs uppercase text-cyan-100/65">
              <tr>
                <th className="px-4 py-3 font-medium">文章</th>
                {REACTION_EMOJIS.map((e) => (
                  <th key={e.key} className="px-2 py-3 text-center font-medium" title={e.label}>
                    {e.glyph}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">合计</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slug} className="border-t border-cyan-200/10 transition hover:bg-cyan-300/[0.035]">
                  <td className="max-w-[20rem] truncate px-4 py-2">
                    <Link href={"/posts/" + r.slug} className="font-medium text-cyan-50 hover:text-white" title={r.title}>
                      {r.title}
                    </Link>
                  </td>
                  {REACTION_EMOJIS.map((e) => (
                    <td key={e.key} className="px-2 py-2 text-center font-mono text-xs text-muted">
                      {r.counts[e.key] || ""}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-mono text-sm font-medium text-cyan-50">
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
