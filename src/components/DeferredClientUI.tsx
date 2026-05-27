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

const MascotRouter = dynamic(
  () => import("@/components/MascotRouter").then((m) => m.MascotRouter),
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

const ClickEffect = dynamic(
  () => import("@/components/ClickEffect").then((m) => m.ClickEffect),
  { ssr: false },
);

const SparkleEffect = dynamic(
  () => import("@/components/SparkleEffect").then((m) => m.SparkleEffect),
  { ssr: false },
);


export function DeferredClientUI() {
  return (
    <>
      <BackToTop />
      <ServiceWorkerRegister />
      <KeyboardShortcuts />
      <MascotRouter />
      <PwaInstallController />
      <BottomTabBar />
      <ClickEffect />
      <SparkleEffect />
    </>
  );
}
