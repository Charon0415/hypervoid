"use client";

import { useEffect, useState } from "react";

export type ReadLaterItem = {
  slug: string;
  title: string;
  description?: string | null;
  addedAt: number;
};

const KEY = "hypervoid:reading-list";
const CHANGE_EVENT = "hypervoid:reading-list-changed";

function readAll(): ReadLaterItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is ReadLaterItem =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as ReadLaterItem).slug === "string" &&
        typeof (x as ReadLaterItem).title === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: ReadLaterItem[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* noop */
  }
}

export function useReadLater(): {
  items: ReadLaterItem[];
  isQueued: (slug: string) => boolean;
  add: (item: Omit<ReadLaterItem, "addedAt">) => void;
  remove: (slug: string) => void;
  toggle: (item: Omit<ReadLaterItem, "addedAt">) => void;
  clear: () => void;
  ready: boolean;
} {
  const [items, setItems] = useState<ReadLaterItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readAll());
    setReady(true);
    const onChange = () => setItems(readAll());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function add(item: Omit<ReadLaterItem, "addedAt">): void {
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
  function toggle(item: Omit<ReadLaterItem, "addedAt">): void {
    if (items.some((x) => x.slug === item.slug)) remove(item.slug);
    else add(item);
  }
  function clear(): void {
    setItems([]);
    writeAll([]);
  }
  const isQueued = (slug: string) => items.some((x) => x.slug === slug);
  return { items, isQueued, add, remove, toggle, clear, ready };
}
