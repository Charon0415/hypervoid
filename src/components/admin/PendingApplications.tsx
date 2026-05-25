"use client";

import { useRouter } from "next/navigation";
import { approveApplicationAction, rejectApplicationAction } from "@/app/admin/friends/actions";

type App = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  email: string | null;
  createdAt: Date;
};

export function PendingApplications({ applications }: { applications: App[] }) {
  const router = useRouter();

  if (applications.length === 0) return null;

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-amber-600 dark:text-amber-400">
          待审核申请
        </h2>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          {applications.length}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{app.name}</p>
              <p className="truncate text-sm text-muted">{app.url}</p>
              {app.description && (
                <p className="mt-0.5 text-sm text-muted">{app.description}</p>
              )}
              {app.email && (
                <p className="mt-0.5 text-xs text-muted">{app.email}</p>
              )}
              <p className="mt-1 text-xs text-muted">
                {new Date(app.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <form
                action={async () => {
                  await approveApplicationAction(app.id);
                  router.refresh();
                }}
              >
                <button
                  type="submit"
                  className="dark-locked rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  通过
                </button>
              </form>
              <form
                action={async () => {
                  await rejectApplicationAction(app.id);
                  router.refresh();
                }}
              >
                <button
                  type="submit"
                  className="dark-locked rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  拒绝
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
