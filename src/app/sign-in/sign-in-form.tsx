"use client";

import { useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import { signIn } from "@/auth.client";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.055,
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const errorCopy: Record<string, string> = {
  AccessDenied: "登录被拒绝，请换一种方式重试。",
  Configuration: "登录服务配置不完整，请稍后再试。",
  Verification: "邮箱链接无效或已过期，请重新发送。",
  OAuthSignin: "GitHub 登录暂时不可用，请稍后重试。",
  OAuthCallback: "GitHub 回调失败，请重新登录。",
};

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.86 8.37 6.84 9.73.5.09.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.94c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.14 10.14 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function readableError(error: string | undefined): string | null {
  if (!error) return null;
  return errorCopy[error] ?? `登录失败：${error}`;
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
  const [loading, setLoading] = useState<"github" | "email" | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const visibleError = localError ?? readableError(error);

  async function handleGitHub() {
    setLocalError(null);
    setLoading("github");
    try {
      await signIn("github", { redirectTo });
    } catch {
      setLocalError("GitHub 登录没有启动，请检查网络后重试。");
      setLoading(null);
    }
  }

  async function handleEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    const email = emailValue.trim();
    if (!emailEnabled) {
      setLocalError("邮箱登录尚未配置 RESEND_API_KEY。");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
        setLocalError(readableError(result.error) ?? "发送失败，请稍后重试。");
        return;
      }

      setEmailValue(email);
      setEmailSent(true);
    } catch {
      setLocalError("发送失败，请稍后重试。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="relative w-full overflow-hidden border border-white/18 bg-black/58 p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,.52)] backdrop-blur-xl sm:p-7"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8f2ff]/70 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 bg-[radial-gradient(circle,rgba(99,214,255,.22),transparent_62%)]" />

      <motion.div custom={0} variants={fadeUp}>
        <p className="text-xs font-semibold uppercase text-[#b8f2ff]/78">
          Secure Gateway / 身份入口
        </p>
        <h2 className="mt-3 text-3xl font-black uppercase leading-none text-white">
          登录 Hypervoid
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/62">
          GitHub 为主要登录方式，邮箱 magic link 作为备用入口。
        </p>
      </motion.div>

      <div aria-live="polite" className="mt-5">
        {visibleError ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="flex items-start gap-3 border border-red-200/36 bg-red-500/12 px-4 py-3 text-sm leading-6 text-red-50"
          >
            <AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{visibleError}</span>
          </motion.div>
        ) : null}
      </div>

      {emailSent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border border-[#b8f2ff]/40 bg-[#b8f2ff]/10 p-5 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center border border-[#b8f2ff]/60 text-[#b8f2ff]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold uppercase">登录链接已发送</p>
              <p className="mt-2 text-sm leading-6 text-white/64">
                请查看 <span className="font-semibold text-white">{emailValue}</span>，链接将在 15 分钟后失效。
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmailValue("");
                  setLocalError(null);
                }}
                className="mt-4 min-h-11 px-0 text-sm font-bold uppercase text-[#b8f2ff] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8f2ff]/50"
              >
                更换邮箱
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div custom={1} variants={fadeUp} className="mt-7">
            <button
              type="button"
              onClick={handleGitHub}
              disabled={loading !== null}
              className="group flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 border border-white/70 bg-white px-5 text-sm font-bold uppercase text-black transition duration-200 hover:border-[#b8f2ff] hover:bg-[#b8f2ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8f2ff]/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "github" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GitHubMark className="h-4 w-4" />
              )}
              <span>使用 GitHub 登录</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-70 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="h-px bg-white/20" />
            <span className="text-xs font-bold uppercase text-white/42">邮箱备用登录</span>
            <div className="h-px bg-white/20" />
          </motion.div>

          <motion.form custom={3} variants={fadeUp} onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor={emailId} className="text-xs font-bold uppercase text-white/72">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/44" aria-hidden="true" />
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  value={emailValue}
                  onChange={(e) => {
                    setEmailValue(e.target.value);
                    setLocalError(null);
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  disabled={loading !== null || !emailEnabled}
                  aria-describedby={`${emailId}-hint`}
                  className="min-h-13 w-full border border-white/20 bg-white/[0.055] pl-11 pr-4 text-base text-white outline-none transition-colors placeholder:text-white/32 focus:border-[#b8f2ff]/70 focus:ring-2 focus:ring-[#b8f2ff]/22 disabled:cursor-not-allowed disabled:opacity-55"
                />
              </div>
              <p id={`${emailId}-hint`} className="text-xs leading-5 text-white/48">
                {emailEnabled
                  ? "发送一次性登录链接，无需密码。"
                  : "邮箱登录未启用，需要配置 RESEND_API_KEY。"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading !== null || !emailEnabled}
              className="group flex min-h-13 w-full cursor-pointer items-center justify-center gap-3 border border-white/24 bg-transparent px-5 text-sm font-bold uppercase text-white transition duration-200 hover:border-[#b8f2ff]/70 hover:bg-[#b8f2ff]/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8f2ff]/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="h-4 w-4" aria-hidden="true" />
              )}
              <span>发送邮箱登录链接</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-70 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </motion.form>
        </>
      )}
    </motion.div>
  );
}
