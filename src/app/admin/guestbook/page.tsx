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
      <header className="hv-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <AdminBackLink href="/admin" label="后台" />
          <div>
            <p className="hv-kicker">Guestbook Intake</p>
            <h1 className="hv-title mt-1 text-2xl font-semibold">留言板管理</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="hv-chip">总计 {messages.length}</span>
          <span className="hv-chip">隐藏 {hidden}</span>
        </div>
      </header>

      {messages.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
          还没有留言。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={"hv-panel flex flex-col gap-3 p-4 " + (m.hidden ? "border-amber-300/35 bg-amber-500/5" : "")}
            >
              <div className="flex items-start gap-3">
                {m.avatarUrl ? (
                  <Image
                    src={m.avatarUrl}
                    alt={m.githubLogin + "的头像"}
                    width={80}
                    height={80}
                    sizes="40px"
                    loading="lazy"
                    className="h-10 w-10 shrink-0 border border-cyan-100/20 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 border border-cyan-100/20 bg-cyan-300/10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium text-cyan-50">
                      {m.githubName ?? m.githubLogin}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      @{m.githubLogin}
                    </span>
                    {m.hidden ? (
                      <span className="border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-100">
                        已隐藏
                      </span>
                    ) : null}
                    <time className="ml-auto font-mono text-xs text-muted">
                      {formatDateTimeCN(m.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-cyan-50/82">
                    {m.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-cyan-200/10 pt-3">
                {m.hidden ? (
                  <form
                    action={async () => {
                      "use server";
                      await unhideAction(m.id);
                    }}
                  >
                    <button type="submit" className="hv-action min-h-0 px-3 py-1 text-xs">
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
                    <button type="submit" className="hv-action min-h-0 px-3 py-1 text-xs hover:border-amber-300/60 hover:text-amber-100">
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
                  <button type="submit" className="border border-red-400/35 bg-red-500/10 px-3 py-1 text-xs text-red-200 transition hover:border-red-300 hover:bg-red-500/15">
                    永久删除
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
