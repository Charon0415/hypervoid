import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { groupByCategory, listResources } from "@/db/resources";
import { createAction, deleteAction, updateAction } from "./actions";

export const metadata: Metadata = {
  title: "资源库管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const list = await listResources({ includeHidden: true });
  const grouped = groupByCategory(list);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">资源库管理</h1>
        <span className="text-sm text-muted">
          共 {list.length} 条 · {grouped.size} 类
        </span>
      </header>

      <p className="text-sm text-muted">
        分享收藏的链接、软件、工具。<code>/resources</code> 按 <code>分类</code>{" "}
        分组展示，按 <code>排序</code> 升序。<code>图标</code> 可填 emoji（如
        🛠️）或留空。
      </p>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">新建资源</h2>
        <form
          action={createAction}
          className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_2fr_1fr_0.6fr_0.6fr_auto] sm:items-end"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">标题</span>
            <input
              type="text"
              name="title"
              required
              placeholder="Figma"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">URL</span>
            <input
              type="url"
              name="url"
              required
              placeholder="https://..."
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">分类</span>
            <input
              type="text"
              name="category"
              placeholder="设计 / 开发 / 软件"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">图标</span>
            <input
              type="text"
              name="icon"
              placeholder="🎨"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">排序</span>
            <input
              type="number"
              name="sortOrder"
              defaultValue={0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            创建
          </button>
          <label className="flex flex-col gap-1 sm:col-span-full">
            <span className="text-xs text-muted">描述（可选）</span>
            <input
              type="text"
              name="description"
              placeholder="一句话说说这是什么"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none"
            />
          </label>
        </form>
      </section>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有资源。
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {[...grouped.entries()].map(([category, items]) => (
            <section
              key={category}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 text-sm font-semibold tracking-tight">
                {category}{" "}
                <span className="ml-1 text-xs text-muted">{items.length}</span>
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((r) => (
                  <details
                    key={r.id}
                    className="group rounded-lg border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2 text-sm">
                      <span className="text-base leading-none">
                        {r.icon || "🔗"}
                      </span>
                      <span className="flex-1 truncate">
                        <span className="font-medium">{r.title}</span>
                        {r.description ? (
                          <span className="ml-2 text-xs text-muted">
                            · {r.description}
                          </span>
                        ) : null}
                      </span>
                      {r.hidden ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                          隐藏
                        </span>
                      ) : null}
                      <span className="font-mono text-[10px] text-muted">
                        #{r.sortOrder}
                      </span>
                      <span className="text-xs text-muted transition group-open:rotate-90">
                        ▸
                      </span>
                    </summary>
                    <form
                      action={updateAction}
                      className="grid gap-2 border-t border-border px-3 py-3 text-sm sm:grid-cols-[1.4fr_2fr_1fr_0.6fr_0.6fr]"
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="text"
                        name="title"
                        defaultValue={r.title}
                        required
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <input
                        type="url"
                        name="url"
                        defaultValue={r.url}
                        required
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        name="category"
                        defaultValue={r.category}
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        name="icon"
                        defaultValue={r.icon ?? ""}
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        name="sortOrder"
                        defaultValue={r.sortOrder}
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        name="description"
                        defaultValue={r.description ?? ""}
                        placeholder="描述（可选）"
                        className="rounded-md border border-border bg-card px-2 py-1.5 text-xs sm:col-span-full"
                      />
                      <div className="flex items-center justify-between gap-3 sm:col-span-full">
                        <label className="flex items-center gap-1.5 text-xs text-muted">
                          <input
                            type="checkbox"
                            name="hidden"
                            defaultChecked={r.hidden}
                            className="accent-primary"
                          />
                          隐藏（不在公开页面显示）
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteAction(r.id);
                      }}
                      className="border-t border-border px-3 py-2 text-right"
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-500/30 bg-red-500/5 px-2.5 py-1 text-[11px] text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                      >
                        删除
                      </button>
                    </form>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
