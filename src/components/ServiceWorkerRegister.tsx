"use client";

import { useEffect } from "react";

const SW_VERSION = "6";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Already registered this version — nothing to do
    if (localStorage.getItem("sw_v") === SW_VERSION) return;

    let refreshing = false;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js?v=6", {
          scope: "/",
        });

        localStorage.setItem("sw_v", SW_VERSION);

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installing.postMessage("skip-waiting");
            }
            if (installing.state === "activated" && !refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        });

        // If a new SW was already waiting, activate it
        if (reg.waiting) {
          reg.waiting.postMessage("skip-waiting");
        }
      } catch {
        // Dev or unsupported — silently skip.
      }
    }

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data === "reload" && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    register();
  }, []);

  return null;
}
