"use client";

import { Check, X } from "lucide-react";
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
    <section className="hv-panel border-amber-300/35 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="hv-kicker text-amber-100/80">Pending Applications</p>
          <h2 className="mt-1 font-semibold text-amber-100">待审核申请</h2>
        </div>
        <span className="border border-amber-300/35 bg-amber-400/10 px-2 py-0.5 font-mono text-xs text-amber-100">
          {applications.length}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex flex-col gap-3 border border-cyan-100/12 bg-black/20 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-cyan-50">{app.name}</p>
              <p className="truncate font-mono text-sm text-muted">{app.url}</p>
              {app.description ? (
                <p className="mt-1 text-sm text-muted">{app.description}</p>
              ) : null}
              {app.email ? (
                <p className="mt-1 font-mono text-xs text-muted">{app.email}</p>
              ) : null}
              <p className="mt-2 font-mono text-xs text-muted">
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
                <button type="submit" className="inline-flex min-h-10 items-center gap-1 border border-emerald-300/35 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  通过
                </button>
              </form>
              <form
                action={async () => {
                  await rejectApplicationAction(app.id);
                  router.refresh();
                }}
              >
                <button type="submit" className="inline-flex min-h-10 items-center gap-1 border border-red-300/35 bg-red-500/10 px-3 text-sm font-medium text-red-100 transition hover:border-red-200">
                  <X className="h-4 w-4" aria-hidden="true" />
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
