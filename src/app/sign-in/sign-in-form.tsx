"use client";

import { useId, useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, GitBranch, Loader2, Mail } from "lucide-react";
import { signIn } from "@/auth.client";

const errorCopy: Record<string, string> = {
  AccessDenied: "登录被拒绝，请换一种方式重试。",
  Configuration: "登录服务配置不完整，请稍后再试。",
  Verification: "邮箱链接无效或已过期，请重新发送。",
  OAuthSignin: "GitHub 登录暂时不可用，请稍后重试。",
  OAuthCallback: "GitHub 回调失败，请重新登录。",
};

function readableError(error: string | undefined): string | null {
  if (!error) return null;
  return errorCopy[error] ?? "登录失败：" + error;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.86 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.94c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.14 10.14 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

export function SignInForm({
  redirectTo,
  error,
  emailEnabled,
}: {
  redirectTo: string;
  error?: string;
  emailEnabled: boolean;
}) {
  const emailId = useId();
  const hintId = emailId + "-hint";
  const [loading, setLoading] = useState<"github" | "email" | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const visibleError = localError ?? readableError(error);

  async function handleGitHub() {
    setLocalError(null);
    setEmailSent(false);
    setLoading("github");
    try {
      await signIn("github", { redirectTo });
    } catch {
      setLocalError("GitHub 授权没有启动，请检查网络后重试。");
      setLoading(null);
    }
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const email = emailValue.trim();
    if (!emailEnabled) {
      setLocalError("邮箱登录尚未配置 RESEND_API_KEY。");
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError("请输入有效的邮箱地址。");
      return;
    }

    setLoading("email");
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        redirectTo,
      });

      if (result?.error) {
        setLocalError(readableError(result.error) ?? "邮箱登录链接发送失败，请稍后再试。");
        return;
      }

      setEmailValue(email);
      setEmailSent(true);
    } catch {
      setLocalError("邮箱登录链接发送失败，请稍后再试。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="hv-panel w-full max-w-[460px] p-7">
      <div className="mb-7 text-center">
        <p className="hv-kicker">Secure Gateway</p>
        <h1 className="hv-title mt-2 text-2xl font-semibold">登录 Hypervoid</h1>
        <p className="mt-2 text-sm text-muted">GitHub 为主要登录方式，邮箱 magic link 作为备用入口。</p>
      </div>

      <div aria-live="polite">
        {visibleError ? (
          <div role="alert" className="mb-5 flex items-start gap-3 border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
            <AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{visibleError}</span>
          </div>
        ) : null}
      </div>

      {emailSent ? (
        <div className="border border-cyan-100/35 bg-cyan-50/10 p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-100/50 text-cyan-100">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-cyan-50">登录链接已发送</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                请查看 <span className="font-semibold text-white">{emailValue}</span>，登录链接将在 15 分钟后失效。
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmailValue("");
                  setLocalError(null);
                }}
                className="mt-4 min-h-11 px-0 text-sm font-bold uppercase text-cyan-100 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/60"
              >
                更换邮箱
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button type="button" onClick={handleGitHub} disabled={loading !== null} className="hv-action hv-chip-strong w-full px-5 text-sm font-semibold disabled:opacity-55">
            {loading === "github" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GitHubMark className="h-4 w-4" />}
            使用 GitHub 登录
            <span className="ml-auto hidden border border-black/20 px-2 py-1 font-mono text-[10px] font-black sm:inline-flex">推荐</span>
          </button>

          <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="h-px bg-white/18" />
            <span className="font-mono text-[10px] uppercase text-white/45">邮箱备用登录</span>
            <div className="h-px bg-white/18" />
          </div>

          <form className="space-y-3" onSubmit={handleEmail} noValidate>
            <label htmlFor={emailId} className="flex items-center gap-2 font-mono text-xs uppercase text-cyan-50/72">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              邮箱地址
            </label>
            <div className="relative">
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={emailValue}
                onChange={(event) => {
                  setEmailValue(event.target.value);
                  setLocalError(null);
                }}
                aria-describedby={hintId}
                disabled={loading !== null || !emailEnabled}
                className="h-12 w-full border border-white/15 bg-black/40 px-4 pr-12 text-base text-white outline-none transition placeholder:text-white/35 focus:border-cyan-100/70 focus:bg-black/50 focus:ring-2 focus:ring-cyan-100/20 disabled:cursor-not-allowed disabled:opacity-55"
                placeholder="you@example.com"
              />
              {loading === "email" ? (
                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-100" aria-hidden="true" />
              ) : (
                <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" aria-hidden="true" />
              )}
            </div>
            <p id={hintId} className="text-xs leading-5 text-white/50">
              {emailEnabled
                ? "将发送一次性登录链接，无需密码。"
                : "邮箱登录未启用，需要配置 RESEND_API_KEY。"}
            </p>
            <button type="submit" disabled={loading !== null || !emailEnabled} className="group inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 border border-white/20 bg-transparent px-5 py-3 text-sm font-black uppercase text-white transition hover:border-cyan-100/60 hover:bg-cyan-50/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55">
              {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
              发送邮箱登录链接
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </form>
        </>
      )}

      <div className="mt-7 grid grid-cols-2 border-y border-white/12 py-3 font-mono text-[10px] uppercase text-white/50">
        <span className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 text-cyan-100" aria-hidden="true" />
          GitHub 主登录
        </span>
        <span className="flex items-center justify-end gap-1.5">
          <Mail className="h-3.5 w-3.5 text-cyan-100" aria-hidden="true" />
          邮箱备用
        </span>
      </div>
    </section>
  );
}
