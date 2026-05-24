"use client";

import { useEffect, useState } from "react";

export type Bookmark = {
  slug: string;
  title: string;
  description?: string | null;
  addedAt: number;
};

const KEY = "hypervoid:bookmarks";

function readAll(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Bookmark =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as Bookmark).slug === "string" &&
        typeof (x as Bookmark).title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: Bookmark[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("hypervoid:bookmarks-changed"));
  } catch {
    // ignore (quota / private mode)
  }
}

export function useBookmarks(): {
  items: Bookmark[];
  isBookmarked: (slug: string) => boolean;
  add: (item: Omit<Bookmark, "addedAt">) => void;
  remove: (slug: string) => void;
  toggle: (item: Omit<Bookmark, "addedAt">) => void;
  ready: boolean;
} {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readAll());
    setReady(true);
    function onChange() {
      setItems(readAll());
    }
    window.addEventListener("hypervoid:bookmarks-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("hypervoid:bookmarks-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function add(item: Omit<Bookmark, "addedAt">): void {
    const next = [
      { ...item, addedAt: Date.now() },
      ...items.filter((x) => x.slug !== item.slug),
    ];
    setItems(next);
    writeAll(next);
  }

  function remove(slug: string): void {
    const next = items.filter((x) => x.slug !== slug);
    setItems(next);
    writeAll(next);
  }

  function toggle(item: Omit<Bookmark, "addedAt">): void {
    if (items.some((x) => x.slug === item.slug)) {
      remove(item.slug);
    } else {
      add(item);
    }
  }

  const isBookmarked = (slug: string) => items.some((x) => x.slug === slug);

  return { items, isBookmarked, add, remove, toggle, ready };
}
