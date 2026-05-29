import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { isEmailConfigured } from "@/lib/email";
import { SignInForm } from "./sign-in-form";
import { SignInVisual } from "./sign-in-visual";

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
    <div data-signin-scroll className="dark-locked fixed inset-0 z-[60] overflow-y-auto bg-black text-white">
      <SignInVisual />
      <div className="relative z-10 mx-auto flex min-h-[185dvh] w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-5 z-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-3 border border-white/24 bg-black/20 px-4 text-sm font-semibold uppercase text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className="grid h-6 w-6 place-items-center border border-current text-xs font-black">
              H
            </span>
            Hypervoid
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase text-white/72 md:flex">
            <span>WebGL access</span>
            <span>Private graph</span>
            <span>Identity</span>
          </nav>
        </header>

        <main className="sticky top-0 grid min-h-dvh flex-1 items-end gap-8 py-24 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-12">
          <section data-parallax-copy className="max-w-3xl pb-2 text-left lg:pb-16">
            <p className="text-sm font-semibold uppercase text-white/72">
              Immersive authentication / Hypervoid coordinate
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl lg:text-[6rem]">
              Enter the void
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/68 sm:text-lg">
              进入你的阅读坐标。GitHub 与邮箱登录会同步书签、留言身份和私密访问权限。
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/18 text-xs font-semibold uppercase text-white/76">
              <div className="border-r border-white/14 py-4 pr-3">
                <span className="block text-white/36">Input</span>
                OAuth
              </div>
              <div className="border-r border-white/14 px-3 py-4">
                <span className="block text-white/36">Signal</span>
                Magic Link
              </div>
              <div className="py-4 pl-3">
                <span className="block text-white/36">State</span>
                Protected
              </div>
            </div>
          </section>

          <section data-parallax-panel className="w-full">
            <SignInForm
              redirectTo={redirectTo}
              error={firstValue(error)}
              emailEnabled={isEmailConfigured()}
            />
          </section>
        </main>

        <div className="min-h-[44dvh]" />
        <footer className="relative z-20 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/14 pt-4 text-xs uppercase text-white/42">
          <span>Active WebGL login scene</span>
          <span>Reduced motion aware</span>
        </footer>
      </div>
    </div>
  );
}
