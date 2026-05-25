import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import {
  AI_MODELS,
  PROVIDERS,
  getActiveAiModel,
  isProviderConfigured,
  providerKeyHint,
  type AiProvider,
} from "@/lib/ai-config";
import { updateModelAction } from "./actions";

export const metadata: Metadata = {
  title: "AI 配置",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ENV_NAME: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
};

const PROVIDER_DOCS: Record<AiProvider, { url: string; hint: string }> = {
  anthropic: {
    url: "https://console.anthropic.com/",
    hint: "在 console.anthropic.com 创建 Key,需要绑卡。",
  },
  deepseek: {
    url: "https://platform.deepseek.com/",
    hint: "在 platform.deepseek.com 创建 Key,支付宝/微信充值。",
  },
};

export default async function AdminAiPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  const current = await getActiveAiModel();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin" label="后台" />
        <h1 className="text-2xl font-bold tracking-tight">AI 配置</h1>
      </header>

      <p className="text-sm text-muted">
        所有 AI 功能（文章摘要、标签建议、AskAI、康娜聊天、写作助手）共用这里选的模型。
        当前生效:{" "}
        <span className="font-mono text-foreground">{current.label}</span>{" "}
        <span className="text-[10px] text-muted">
          ({current.upstreamId})
        </span>
      </p>

      <section className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => {
          const ok = isProviderConfigured(p.id);
          const masked = providerKeyHint(p.id);
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 ${
                current.provider === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <header className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-tight">
                  {p.label}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    ok
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-500/15 text-red-700 dark:text-red-300"
                  }`}
                >
                  {ok ? "已配置" : "未配置"}
                </span>
              </header>
              <p className="font-mono text-[11px] text-muted">{masked}</p>
              <p className="mt-2 text-xs text-muted">
                环境变量:{" "}
                <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">
                  {ENV_NAME[p.id]}
                </code>
              </p>
              <p className="mt-1 text-xs text-muted">
                {PROVIDER_DOCS[p.id].hint}{" "}
                <a
                  href={PROVIDER_DOCS[p.id].url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary hover:underline"
                >
                  控制台 ↗
                </a>
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-sm font-semibold tracking-tight">模型选择</h2>
        <p className="mb-4 text-xs text-muted">
          换模型立即生效——下一次请求即用新模型。Pro 类模型更贵更慢但更聪明,Flash 类更快更便宜。
        </p>
        <form action={updateModelAction} className="flex flex-col gap-3">
          {(["deepseek", "anthropic"] as AiProvider[]).map((provider) => {
            const models = AI_MODELS.filter((m) => m.provider === provider);
            const providerOk = isProviderConfigured(provider);
            return (
              <div key={provider} className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest text-muted">
                  {PROVIDERS.find((p) => p.id === provider)?.label}
                  {!providerOk ? (
                    <span className="ml-2 normal-case tracking-normal text-red-500">
                      ({ENV_NAME[provider]} 未配置 — 选了也不能用)
                    </span>
                  ) : null}
                </p>
                {models.map((m) => {
                  const active = m.id === current.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40"
                      } ${!providerOk ? "opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={m.id}
                        defaultChecked={active}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {m.label}
                          <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted">
                            {m.upstreamId}
                          </code>
                        </span>
                        <span className="text-xs text-muted">{m.hint}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
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
          <FeatureCard title="AskAI" hint="文章页访客提问,按文章内容回答" />
          <FeatureCard
            title="康娜聊天"
            hint="看板娘的对话功能(角色扮演 prompt)"
          />
          <FeatureCard
            title="写作助手"
            hint="编辑页大纲 / 润色 / 起标题 / TL;DR"
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
