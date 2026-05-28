"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/auth.client";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function SignInForm({
  redirectTo,
  error,
}: {
  redirectTo: string;
  error?: string;
}) {
  const [loading, setLoading] = useState<"github" | "email" | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleGitHub() {
    setLoading("github");
    await signIn("github", { redirectTo });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);

    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailError("请输入有效的邮箱地址");
      return;
    }

    setLoading("email");
    try {
      await signIn("email", { email: emailValue, redirectTo });
      setEmailSent(true);
    } catch {
      setEmailError("发送失败，请稍后重试");
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20"
    >
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header */}
      <motion.div custom={0} variants={fadeUp} className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hypervoid
        </h1>
        <p className="mt-2 text-sm text-muted">
          登录以解锁完整体验
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {error === "AccessDenied" ? "登录被拒绝，请重试" : `登录失败：${error}`}
        </motion.div>
      )}

      {/* Email sent confirmation */}
      {emailSent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">查看你的邮箱</p>
            <p className="mt-1 text-sm text-muted">
              登录链接已发送至 <span className="text-foreground">{emailValue}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmailValue("");
            }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            使用其他邮箱
          </button>
        </motion.div>
      ) : (
        <>
          {/* GitHub button */}
          <motion.div custom={1} variants={fadeUp}>
            <button
              onClick={handleGitHub}
              disabled={loading !== null}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50"
            >
              {loading === "github" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              <span>使用 GitHub 登录</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60" />
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div custom={2} variants={fadeUp} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted/60">或</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          {/* Email form */}
          <motion.form
            custom={3}
            variants={fadeUp}
            onSubmit={handleEmail}
            className="space-y-3"
          >
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={emailValue}
                onChange={(e) => {
                  setEmailValue(e.target.value);
                  setEmailError(null);
                }}
                placeholder="your@email.com"
                autoComplete="email"
                disabled={loading !== null}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-red-500">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading !== null}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
            >
              {loading === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>邮箱登录</span>
              <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60" />
            </button>
          </motion.form>
        </>
      )}

      {/* Footer */}
      <motion.p
        custom={4}
        variants={fadeUp}
        className="mt-8 text-center text-xs text-muted/50"
      >
        登录即表示同意本站的服务条款
      </motion.p>
    </motion.div>
  );
}
