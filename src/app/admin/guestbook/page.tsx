import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { listAllMessages } from "@/db/guestbook";
import { formatDateTimeCN } from "@/lib/datetime";
import {
  deleteAction,
  hideAction,
  unhideAction,
} from "./actions";

export const metadata: Metadata = {
  title: "留言板管理",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminGuestbookPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const messages = await listAllMessages();
  const hidden = messages.filter((m) => m.hidden).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AdminBackLink href="/admin" label="后台" />
          <h1 className="text-2xl font-bold tracking-tight">留言板管理</h1>
          <span className="text-sm text-muted">
            共 {messages.length} 条 · {hidden} 已隐藏
          </span>
        </div>
      </header>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有留言。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 ${
                m.hidden
                  ? "border-amber-400/30 bg-amber-400/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                {m.avatarUrl ? (
                  <Image
                    src={m.avatarUrl}
                    alt={`${m.githubLogin}的头像`}
                    width={80}
                    height={80}
                    sizes="40px"
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted/20" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {m.githubName ?? m.githubLogin}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      @{m.githubLogin}
                    </span>
                    {m.hidden ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-300">
                        已隐藏
                      </span>
                    ) : null}
                    <time className="ml-auto font-mono text-xs text-muted">
                      {formatDateTimeCN(m.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">
                    {m.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border/60 pt-2">
                {m.hidden ? (
                  <form
                    action={async () => {
                      "use server";
                      await unhideAction(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-border bg-card px-3 py-1 text-xs transition hover:border-primary hover:text-primary"
                    >
                      取消隐藏
                    </button>
                  </form>
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await hideAction(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-border bg-card px-3 py-1 text-xs transition hover:border-amber-500 hover:text-amber-600"
                    >
                      隐藏
                    </button>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await deleteAction(m.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-1 text-xs text-red-600 transition hover:border-red-500 hover:bg-red-500/10 dark:text-red-400"
                  >
                    永久删除
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted">
        提示：「隐藏」可恢复，「永久删除」无法撤销。
      </p>
    </div>
  );
}
