import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import {
  AI_MODELS,
  getAiModel,
  isAiKeyConfigured,
  maskedKeyHint,
} from "@/lib/ai-config";
import { updateModelAction } from "./actions";

export const metadata: Metadata = {
  title: "AI 配置",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAiPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const current = await getAiModel();
  const keyOk = isAiKeyConfigured();
  const masked = maskedKeyHint();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">AI 配置</h1>
      </header>

      <p className="text-sm text-muted">
        所有 AI 功能（文章摘要、标签建议、AskAI、康娜聊天）共用这里选定的模型与 API Key。
      </p>

      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">API Key</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              keyOk
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/15 text-red-700 dark:text-red-300"
            }`}
          >
            {keyOk ? "已配置" : "未配置"}
          </span>
        </header>
        <p className="font-mono text-xs text-muted">{masked}</p>
        <p className="mt-2 text-xs text-muted">
          出于安全考虑，API Key 仅存在于环境变量（<code>ANTHROPIC_API_KEY</code>）中，不在 DB 里。要更换：
          在 Vercel 项目设置 → Environment Variables 修改后重新部署，或在本地 <code>.env.local</code> 修改后重启。
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">模型选择</h2>
        <p className="mb-4 text-xs text-muted">
          当前：<span className="font-mono text-foreground">{current}</span>。
          换模型会立即生效，下一次请求即用新模型。
        </p>
        <form action={updateModelAction} className="flex flex-col gap-3">
          {AI_MODELS.map((m) => {
            const active = m.id === current;
            return (
              <label
                key={m.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={m.id}
                  defaultChecked={active}
                  className="mt-1 accent-primary"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {m.label}
                    <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {m.id}
                    </code>
                  </span>
                  <span className="text-xs text-muted">{m.hint}</span>
                </div>
              </label>
            );
          })}
          <button
            type="submit"
            className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            保存
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">使用范围</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-xs">
          <FeatureCard
            title="文章摘要"
            hint="发布时自动生成 / 编辑页手动重生"
          />
          <FeatureCard title="标签建议" hint="编辑页「AI 建议标签」按钮" />
          <FeatureCard title="AskAI" hint="文章页访客提问，按文章内容回答" />
          <FeatureCard
            title="康娜聊天"
            hint="看板娘的对话功能（角色扮演 prompt）"
          />
        </ul>
      </section>
    </div>
  );
}

function FeatureCard({ title, hint }: { title: string; hint: string }) {
  return (
    <li className="rounded-lg border border-border bg-background p-3">
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 text-muted">{hint}</p>
    </li>
  );
}
