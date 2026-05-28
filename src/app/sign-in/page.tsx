import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth, signIn } from "@/auth";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "登录 · Hypervoid",
  robots: { index: false, follow: false },
};

function safeInternalPath(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await props.searchParams;
  const redirectTo = safeInternalPath(callbackUrl, "/");

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-[120px] dark:bg-primary/12" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <SignInForm redirectTo={redirectTo} error={error} />
      </div>
    </div>
  );
}
