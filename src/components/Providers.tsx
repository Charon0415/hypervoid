"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/components/LocaleProvider";

export function Providers({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      nonce={nonce}
    >
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
