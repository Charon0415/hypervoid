"use client";

import { useEffect, useState } from "react";

const KEY = "hypervoid:read-posts";
const MAX = 1000;

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((x) => typeof x === "string"));
    return new Set();
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  try {
    const arr = [...set].slice(-MAX);
    window.localStorage.setItem(KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event("hypervoid:read-changed"));
  } catch {
    // ignore
  }
}

/** Read the current set of read slugs as React state. Re-renders on changes. */
export function useReadPosts(): Set<string> {
  const [set, setState] = useState<Set<string>>(new Set());

  useEffect(() => {
    setState(readSet());
    function onChange() {
      setState(readSet());
    }
    window.addEventListener("hypervoid:read-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("hypervoid:read-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return set;
}

/** Mark a slug as read. Use inside a useEffect on the article page. */
export function markRead(slug: string): void {
  const set = readSet();
  if (set.has(slug)) return;
  set.add(slug);
  writeSet(set);
}
