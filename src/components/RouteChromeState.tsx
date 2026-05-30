"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isFullScreenPath(pathname: string) {
  return pathname === "/sign-in" || pathname.startsWith("/sign-in/");
}

export function RouteChromeState() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.fullscreenRoute = isFullScreenPath(pathname) ? "true" : "false";
  }, [pathname]);

  return null;
}
