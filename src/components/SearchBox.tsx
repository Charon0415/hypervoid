"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useT } from "@/components/LocaleProvider";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();
  const [q, setQ] = useState(initial || params.get("q") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.common.searchPlaceholder}
        className="min-h-11 w-full border border-cyan-100/18 bg-white/[0.055] px-3 py-2 pl-10 text-sm text-cyan-50 placeholder:text-cyan-50/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition focus:border-cyan-100/45 focus:bg-white/[0.075] focus:outline-none"
        aria-label={t.common.search}
      />
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55"
      />
    </form>
  );
}
