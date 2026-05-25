"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { bulkAction, type BulkOp } from "@/app/admin/posts/actions";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  scheduled: "定时",
  published: "已发布",
};

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
  scheduled: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

export type PostRow = {
  slug: string;
  title: string;
  category: string | null;
  status: string;
  visibility: string;
  pinned: boolean;
  publishAt: Date | null;
  updatedAt: Date;
};

function effectiveStatus(
  status: string,
  publishAt: Date | null,
): { key: string; suffix: string } {
  if (status === "scheduled" && publishAt && publishAt.getTime() <= Date.now()) {
    return { key: "published", suffix: " · 来自定时" };
  }
  return { key: status, suffix: "" };
}

export function PostsTable({
  posts,
  activeCategoryEmpty,
}: {
  posts: PostRow[];
  activeCategoryEmpty: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === posts.length) setSelected(new Set());
    else setSelected(new Set(posts.map((p) => p.slug)));
  };

  const run = (op: BulkOp, confirmMsg?: string) => {
    if (selected.size === 0) return;
    if (confirmMsg && !confirm(confirmMsg.replace("{n}", String(selected.size)))) {
      return;
    }
    const slugs = [...selected];
    setStatus(null);
    startTransition(async () => {
      const { affected } = await bulkAction(slugs, op);
      setStatus(`已应用：${affected} 篇 ${LABELS[op]}`);
      setSelected(new Set());
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 ? (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/40 bg-card/95 p-3 text-xs shadow-md backdrop-blur">
          <span className="font-medium">
            已选 <span className="font-mono text-primary">{selected.size}</span> 篇
          </span>
          <BulkBtn onClick={() => run("publish")} disabled={pending}>
            发布
          </BulkBtn>
          <BulkBtn onClick={() => run("draft")} disabled={pending}>
            转草稿
          </BulkBtn>
          <BulkBtn onClick={() => run("set-public")} disabled={pending}>
            公开
          </BulkBtn>
          <BulkBtn onClick={() => run("set-private")} disabled={pending}>
            私密
          </BulkBtn>
          <BulkBtn onClick={() => run("pin")} disabled={pending}>
            置顶
          </BulkBtn>
          <BulkBtn onClick={() => run("unpin")} disabled={pending}>
            取消置顶
          </BulkBtn>
          <BulkBtn
            onClick={() =>
              run(
                "delete",
                "确定要删除选中的 {n} 篇文章吗？此操作不可恢复。",
              )
            }
            disabled={pending}
            danger
          >
            删除
          </BulkBtn>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto rounded-md px-2 py-1 text-xs text-muted hover:text-foreground"
          >
            取消选择
          </button>
        </div>
      ) : null}

      {status ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
          {status}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-card text-left">
            <tr>
              <th className="w-10 px-2 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === posts.length && posts.length > 0}
                  onChange={toggleAll}
                  className="accent-primary"
                  aria-label="全选"
                />
              </th>
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">发布</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  {activeCategoryEmpty
                    ? "该分类下还没有文章。"
                    : "还没有文章。点右上角新建。"}
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const eff = effectiveStatus(post.status, post.publishAt);
                const checked = selected.has(post.slug);
                return (
                  <tr
                    key={post.slug}
                    className={`border-t border-border ${
                      checked ? "bg-primary/5" : "bg-background"
                    }`}
                  >
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(post.slug)}
                        className="accent-primary"
                        aria-label={`选择 ${post.title}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {post.pinned ? (
                        <span className="mr-1" title="置顶">
                          📌
                        </span>
                      ) : null}
                      {post.visibility === "private" ? (
                        <span title="私密" className="mr-1">
                          🔒
                        </span>
                      ) : null}
                      {post.title}
                      {post.category ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {post.category}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {post.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLASS[eff.key]}`}
                      >
                        {STATUS_LABEL[eff.key]}
                        {eff.suffix ? (
                          <span className="text-muted">{eff.suffix}</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {post.publishAt
                        ? new Date(post.publishAt).toLocaleString("zh-CN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/posts/${post.slug}/edit`}
                        className="text-primary hover:underline"
                      >
                        编辑
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const LABELS: Record<BulkOp, string> = {
  publish: "已发布",
  draft: "转为草稿",
  "set-public": "已设为公开",
  "set-private": "已设为私密",
  pin: "已置顶",
  unpin: "已取消置顶",
  delete: "已删除",
};

function BulkBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border px-2.5 py-1 transition disabled:opacity-50 ${
        danger
          ? "border-red-500/30 bg-red-500/5 text-red-600 hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
          : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
