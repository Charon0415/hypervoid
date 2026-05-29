"use client";

import { useEffect } from "react";

const SW_VERSION = "7";

function isLocalDevHost() {
  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
}

async function unregisterAllServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("hypervoid-")).map((key) => caches.delete(key)));
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let refreshing = false;

    async function setup() {
      try {
        // Service Workers are a poor fit for Next dev chunks: chunk filenames
        // churn constantly and stale SWs can block CSS/JS. Keep localhost clean.
        if (process.env.NODE_ENV !== "production" || isLocalDevHost()) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length > 0) {
            await unregisterAllServiceWorkers();
            localStorage.removeItem("sw_v");
            if (!sessionStorage.getItem("sw_dev_cleanup_reloaded")) {
              sessionStorage.setItem("sw_dev_cleanup_reloaded", "1");
              window.location.reload();
            }
          }
          return;
        }

        if (localStorage.getItem("sw_v") === SW_VERSION) return;

        const reg = await navigator.serviceWorker.register("/sw.js?v=" + SW_VERSION, {
          scope: "/",
        });

        localStorage.setItem("sw_v", SW_VERSION);

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage("skip-waiting");
            }
            if (installing.state === "activated" && !refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        });

        if (reg.waiting) reg.waiting.postMessage("skip-waiting");
      } catch {
        // Unsupported, blocked, or dev-only failure. Do not break rendering.
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data === "reload" && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    setup();
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  return null;
}
