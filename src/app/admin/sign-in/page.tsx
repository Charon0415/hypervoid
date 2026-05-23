import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await props.searchParams;

  if (session?.user) {
    redirect(callbackUrl ?? "/admin");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Hypervoid 管理后台</h1>
        <p className="mt-2 text-sm text-muted">
          只有博主本人（GitHub: @HyperCharon）能进入。
        </p>
      </div>
      {error ? (
        <div className="w-full rounded-md border border-red-400/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error === "AccessDenied"
            ? "你不是博主本人，无权访问。"
            : `登录失败：${error}`}
        </div>
      ) : null}
      <form
        action={async () => {
          "use server";
          await signIn("github", {
            redirectTo: callbackUrl ?? "/admin",
          });
        }}
        className="w-full"
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          使用 GitHub 登录
        </button>
      </form>
      <p className="text-xs text-muted">
        登录会通过 GitHub OAuth 验证你的身份。我们不存储你的密码。
      </p>
    </div>
  );
}
