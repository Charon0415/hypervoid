import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { isEmailConfigured } from "@/lib/email";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "登录 · Hypervoid",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeInternalPath(value: string | string[] | undefined, fallback: string): string {
  const path = firstValue(value);
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await props.searchParams;
  const redirectTo = safeInternalPath(callbackUrl, "/");

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black px-4 py-10 text-white">
      <video className="absolute inset-0 h-full w-full object-cover opacity-55" autoPlay loop muted playsInline preload="metadata">
        <source src="/1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(103,232,249,0.10),transparent_34rem),linear-gradient(180deg,rgba(2,4,10,0.38),rgba(2,4,10,0.94))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70" />

      <main className="relative z-10 flex min-h-[calc(100dvh-5rem)] items-center justify-center">
        <SignInForm
          redirectTo={redirectTo}
          error={firstValue(error)}
          emailEnabled={isEmailConfigured()}
        />
      </main>
    </div>
  );
}
