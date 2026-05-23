import type { Metadata } from "next";

export const metadata: Metadata = { title: "友链" };

const FRIENDS = [
  {
    name: "示例朋友 A",
    url: "https://example.com",
    description: "他的博客 / 主页一句话介绍",
  },
];

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">友链</h1>
        <p className="mt-2 text-muted">朋友们的博客与个人站点。</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {FRIENDS.map((friend) => (
          <a
            key={friend.url}
            href={friend.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
          >
            <h3 className="text-base font-semibold group-hover:text-primary">
              {friend.name}
            </h3>
            <p className="text-sm text-muted">{friend.description}</p>
            <p className="mt-1 text-xs text-muted">{friend.url}</p>
          </a>
        ))}
      </div>
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
        想交换友链？欢迎在 GitHub 提 issue 或邮件联系。
      </p>
    </div>
  );
}
