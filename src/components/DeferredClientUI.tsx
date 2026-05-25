"use client";

import dynamic from "next/dynamic";

/**
 * Non-critical floating UI is deferred so it doesn't ship in the initial
 * HTML/JS chunks. Each piece is fetched only after the main app boots,
 * cutting first-paint TTI on slow connections.
 *
 * Anything required for first-paint (Backdrop, SiteHeader, etc.) lives
 * directly in the server layout instead.
 */

const BackToTop = dynamic(
  () => import("@/components/BackToTop").then((m) => m.BackToTop),
  { ssr: false },
);

const ServiceWorkerRegister = dynamic(
  () =>
    import("@/components/ServiceWorkerRegister").then(
      (m) => m.ServiceWorkerRegister,
    ),
  { ssr: false },
);

const KeyboardShortcuts = dynamic(
  () =>
    import("@/components/KeyboardShortcuts").then((m) => m.KeyboardShortcuts),
  { ssr: false },
);

const Live2DMascot = dynamic(
  () => import("@/components/Live2DMascot").then((m) => m.Live2DMascot),
  { ssr: false },
);

const PwaInstallController = dynamic(
  () =>
    import("@/components/PwaInstallController").then(
      (m) => m.PwaInstallController,
    ),
  { ssr: false },
);

const BottomTabBar = dynamic(
  () =>
    import("@/components/BottomTabBar").then((m) => m.BottomTabBar),
  { ssr: false },
);

export function DeferredClientUI() {
  return (
    <>
      <BackToTop />
      <ServiceWorkerRegister />
      <KeyboardShortcuts />
      <Live2DMascot />
      <PwaInstallController />
      <BottomTabBar />
    </>
  );
}
