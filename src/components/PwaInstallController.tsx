"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Captures and re-exposes the browser's `beforeinstallprompt` event so the
 * user can choose to install Hypervoid from the site-settings panel rather
 * than being pestered by an auto-popup. The captured event is stored on
 * `window.__hypervoidInstallPrompt` and a `hypervoid:install-ready` /
 * `hypervoid:install-cleared` CustomEvent is fired so listeners (the
 * settings panel) can react.
 */
declare global {
  interface Window {
    __hypervoidInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function PwaInstallController() {
  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      window.__hypervoidInstallPrompt = e as BeforeInstallPromptEvent;
      window.dispatchEvent(new CustomEvent("hypervoid:install-ready"));
    }
    function onInstalled() {
      window.__hypervoidInstallPrompt = null;
      window.dispatchEvent(new CustomEvent("hypervoid:install-cleared"));
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  return null;
}

/**
 * Hook for the settings panel — returns whether install is available and a
 * trigger that fires the saved prompt. Returns `available: false` when the
 * browser hasn't fired beforeinstallprompt yet (already standalone, iOS, etc.)
 */
export function useInstallPrompt(): {
  available: boolean;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
} {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(Boolean(window.__hypervoidInstallPrompt));
    const onReady = () => setAvailable(true);
    const onCleared = () => setAvailable(false);
    window.addEventListener("hypervoid:install-ready", onReady);
    window.addEventListener("hypervoid:install-cleared", onCleared);
    return () => {
      window.removeEventListener("hypervoid:install-ready", onReady);
      window.removeEventListener("hypervoid:install-cleared", onCleared);
    };
  }, []);

  const install = async () => {
    const evt = window.__hypervoidInstallPrompt;
    if (!evt) return "unavailable" as const;
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "accepted") {
        window.__hypervoidInstallPrompt = null;
        window.dispatchEvent(new CustomEvent("hypervoid:install-cleared"));
      }
      return outcome;
    } catch {
      return "dismissed" as const;
    }
  };

  return { available, install };
}
