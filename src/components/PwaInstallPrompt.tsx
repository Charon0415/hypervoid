"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hypervoid:install-dismissed";
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    function onPrompt(e: Event) {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setEvent(null);
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        /* noop */
      }
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!event) return null;

  const install = async () => {
    if (installing) return;
    setInstalling(true);
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === "dismissed") {
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          /* noop */
        }
      }
    } catch {
      /* noop */
    } finally {
      setEvent(null);
      setInstalling(false);
    }
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    setEvent(null);
  };

  return (
    <div
      role="dialog"
      aria-label="安装 Hypervoid"
      className="fixed bottom-4 left-4 z-40 flex max-w-xs items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl backdrop-blur-md animate-[sheetUp_220ms_ease-out]"
    >
      <span aria-hidden className="text-2xl leading-none">
        📲
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">把 Hypervoid 装到桌面</p>
        <p className="mt-0.5 text-xs text-muted">
          离线也能读，启动比浏览器标签快。
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {installing ? "安装中…" : "安装"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-border bg-background px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-foreground"
          >
            稍后
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭"
        className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        ×
      </button>
    </div>
  );
}
