"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CHAR_KEY = "hypervoid:mascot-char";

const Live2DMascot = dynamic(
  () => import("@/components/Live2DMascot").then((m) => m.Live2DMascot),
  { ssr: false },
);

const GifMascot = dynamic(
  () => import("@/components/GifMascot").then((m) => m.GifMascot),
  { ssr: false },
);

function readCachedChar(): "kanna" | "rem" {
  if (typeof window === "undefined") return "kanna";
  try {
    const v = localStorage.getItem(CHAR_KEY);
    return v === "rem" ? "rem" : "kanna";
  } catch {
    return "kanna";
  }
}

export function MascotRouter() {
  const [character, setCharacter] = useState<"kanna" | "rem">(readCachedChar);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mascot/character")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const ch = data.character === "rem" ? "rem" : "kanna";
        setCharacter(ch);
        try {
          localStorage.setItem(CHAR_KEY, ch);
        } catch {
          /* noop */
        }
      })
      .catch(() => {
        /* use cached value */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return character === "rem" ? <GifMascot /> : <Live2DMascot />;
}
