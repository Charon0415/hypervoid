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

type MascotChar = "kanna" | "rem";

function readStoredChar(): MascotChar | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CHAR_KEY);
    return v === "rem" || v === "kanna" ? v : null;
  } catch {
    return null;
  }
}

export function MascotRouter() {
  const [character, setCharacter] = useState<MascotChar>(() =>
    readStoredChar() ?? "kanna",
  );

  useEffect(() => {
    if (readStoredChar()) return;

    let cancelled = false;
    fetch("/api/mascot/character")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCharacter(data.character === "rem" ? "rem" : "kanna");
      })
      .catch(() => {
        /* use initial value */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return character === "rem" ? <GifMascot /> : <Live2DMascot />;
}
