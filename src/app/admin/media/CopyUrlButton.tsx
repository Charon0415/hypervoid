"use client";

import { useState } from "react";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallthrough
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] transition hover:border-primary hover:text-primary"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}
