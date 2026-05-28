import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth, signIn, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

function safeAdminPath(value: string | undefined): string {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }
  return value;
}

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await props.searchParams;
  const redirectTo = safeAdminPath(callbackUrl);

  const user = session?.user as
    | { isAdmin?: boolean; login?: string | null }
    | undefined;

  if (user?.isAdmin) {
    redirect(redirectTo);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-xl dark:shadow-black/20">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Hypervoid
            </h1>
            <p className="mt-2 text-sm text-muted">
              管理后台 · 仅限博主
            </p>
          </div>

          {error || user ? (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {user
                ? `当前登录身份 @${user.login ?? "?"} 不是博主本人。`
                : error === "AccessDenied"
                  ? "你不是博主本人，无权访问。"
                  : `登录失败：${error}`}
            </div>
          ) : null}

          {user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/sign-in" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/5"
              >
                退出当前账号
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo });
              }}
            >
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-all duration-200 hover:opacity-90 hover:shadow-lg"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                使用 GitHub 登录
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-muted/50">
            只有博主本人（@HyperCharon）能进入
          </p>
        </div>
      </div>
    </div>
  );
}
