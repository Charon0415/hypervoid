import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { isEmailConfigured } from "@/lib/email";
import { AdminSignInForm } from "./AdminSignInForm";

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
    | { isAdmin?: boolean; login?: string | null; email?: string | null }
    | undefined;

  if (user?.isAdmin) {
    redirect(redirectTo);
  }

  const currentIdentity = user
    ? user.login
      ? "@" + user.login
      : user.email
        ? user.email
        : "未知账号"
    : undefined;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black px-4 py-10 text-white">
      <video className="absolute inset-0 h-full w-full object-cover opacity-55" autoPlay loop muted playsInline preload="metadata">
        <source src="/1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(167,139,250,0.10),transparent_34rem),linear-gradient(180deg,rgba(2,4,10,0.38),rgba(2,4,10,0.94))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70" />

      <main className="relative z-10 flex min-h-[calc(100dvh-5rem)] items-center justify-center">
        <AdminSignInForm
          redirectTo={redirectTo}
          error={error}
          emailEnabled={isEmailConfigured()}
          currentIdentity={currentIdentity}
        />
      </main>
    </div>
  );
}
