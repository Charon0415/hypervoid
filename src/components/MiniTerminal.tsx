"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { siteConfig } from "@/lib/site-config";

/**
 * Tiny terminal-emulator widget for the home sidebar. Runs a fixed
 * whitelist of read-only commands that navigate inside the blog. Built
 * client-side from data the server snapshotted at page render — no
 * runtime API surface, no eval, no dangerouslySetInnerHTML.
 *
 * Security:
 *   - Commands are dispatched via switch on a known name. Unknown name
 *     → error line; no fallback execution path.
 *   - Arguments are treated as strings and only matched against
 *     server-known slugs/tags/paths; anything else falls through to
 *     "未找到" instead of being interpreted.
 *   - Inputs are capped at 200 chars and stripped of C0 control bytes.
 *   - Output history is capped at MAX_LINES so unbounded `echo` loops
 *     can't OOM the page.
 *   - Output renders as React text nodes / next/link only. No raw HTML.
 */

const MAX_LINES = 200;
const MAX_INPUT = 200;
const HISTORY_LIMIT = 30;
const SAFE_PATH = /^\/[\w\-./]*$/;
const SAFE_SLUG = /^[\w\-]+$/;

type Line =
  | { kind: "input"; text: string }
  | { kind: "text"; text: string }
  | { kind: "muted"; text: string }
  | { kind: "error"; text: string }
  | { kind: "link"; text: string; href: string; external?: boolean };

type Post = { slug: string; title: string };
type Tag = { tag: string; count: number };

let lineId = 0;

const sanitize = (s: string) =>
  s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "").slice(0, MAX_INPUT);

const BANNER: Line[] = [
  { kind: "muted", text: "hypervoid:~ $ welcome" },
  { kind: "text", text: "Hypervoid 终端 v1.0 — 输入 help 查看可用命令" },
];

export function MiniTerminal({
  posts,
  tags,
  me,
}: {
  posts: Post[];
  tags: Tag[];
  me: string | null;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [lines, setLines] = useState<{ id: number; line: Line }[]>(() =>
    BANNER.map((l) => ({ id: ++lineId, line: l })),
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the scroll pinned to bottom when new lines come in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const append = useCallback((items: Line[]) => {
    setLines((prev) => {
      const next = [...prev, ...items.map((l) => ({ id: ++lineId, line: l }))];
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
    });
  }, []);

  const clearScreen = useCallback(() => {
    setLines([]);
  }, []);

  const run = useCallback(
    (rawCmd: string) => {
      const cmd = sanitize(rawCmd).trim();
      if (!cmd) return;

      append([{ kind: "input", text: cmd }]);
      setHistory((prev) => {
        const next = [...prev, cmd];
        return next.length > HISTORY_LIMIT ? next.slice(-HISTORY_LIMIT) : next;
      });
      setHistIdx(-1);

      const parts = cmd.split(/\s+/);
      const name = (parts[0] ?? "").toLowerCase();
      const args = parts.slice(1);
      const rest = args.join(" ");

      switch (name) {
        case "help":
        case "?":
        case "h": {
          append([
            { kind: "muted", text: "可用命令：" },
            { kind: "text", text: "  help              显示帮助" },
            { kind: "text", text: "  posts [n]         列出最新文章" },
            { kind: "text", text: "  latest            打开最新文章" },
            { kind: "text", text: "  ls                列出常用入口" },
            { kind: "text", text: "  pwd               当前站点位置" },
            { kind: "text", text: "  open <slug>       打开指定文章" },
            { kind: "text", text: "  tags              列出热门标签" },
            { kind: "text", text: "  tag <name>        打开某个标签页" },
            { kind: "text", text: "  search <关键词>    跳转到搜索页" },
            { kind: "text", text: "  random            随机文章" },
            { kind: "text", text: "  go <路径>          跳转站内路径" },
            { kind: "text", text: "  theme <l|d|sys>   切换主题" },
            { kind: "text", text: "  whoami            当前身份" },
            { kind: "text", text: "  music/anime/games 快速打开页面" },
            { kind: "text", text: "  rss/repo          打开 RSS / GitHub" },
            { kind: "text", text: "  date              当前时间" },
            { kind: "text", text: "  echo <文字>        回显" },
            { kind: "text", text: "  clear             清屏" },
          ]);
          return;
        }
        case "ls":
        case "dir": {
          append([
            { kind: "muted", text: "常用入口：" },
            { kind: "link", text: "  /posts      所有文章", href: "/posts" },
            { kind: "link", text: "  /archive    归档", href: "/archive" },
            { kind: "link", text: "  /tags       标签", href: "/tags" },
            { kind: "link", text: "  /music      音乐", href: "/music" },
            { kind: "link", text: "  /anime      番剧", href: "/anime" },
            { kind: "link", text: "  /games      游戏", href: "/games" },
            { kind: "link", text: "  /about      关于", href: "/about" },
          ]);
          return;
        }
        case "pwd": {
          append([{ kind: "text", text: "https://hypervoid.top/" }]);
          return;
        }
        case "latest": {
          const p = posts[0];
          if (!p) {
            append([{ kind: "muted", text: "没有可用的文章" }]);
            return;
          }
          append([{ kind: "text", text: `打开最新文章 → ${p.title}` }]);
          router.push(`/posts/${p.slug}`);
          return;
        }
        case "posts": {
          const n = Math.min(
            posts.length,
            Math.max(1, parseInt(args[0] ?? "10", 10) || 10),
          );
          const slice = posts.slice(0, n);
          append([
            { kind: "muted", text: `最新 ${slice.length} 篇文章：` },
            ...slice.map<Line>((p, i) => ({
              kind: "link",
              text: `${String(i + 1).padStart(2, " ")}. ${p.title}`,
              href: `/posts/${p.slug}`,
            })),
            { kind: "muted", text: `→ 用 "open <slug>" 直接打开` },
          ]);
          return;
        }
        case "open":
        case "cat":
        case "post": {
          const slug = args[0];
          if (!slug) {
            append([{ kind: "error", text: `用法：${name} <slug>` }]);
            return;
          }
          if (!SAFE_SLUG.test(slug)) {
            append([{ kind: "error", text: "slug 只能包含字母/数字/横线" }]);
            return;
          }
          const hit = posts.find((p) => p.slug === slug);
          if (!hit) {
            append([
              { kind: "error", text: `未找到 slug=${slug}` },
              {
                kind: "muted",
                text: "→ 输入 posts 查看可用 slug",
              },
            ]);
            return;
          }
          append([
            { kind: "text", text: `正在打开 ${hit.title} …` },
          ]);
          router.push(`/posts/${slug}`);
          return;
        }
        case "tags": {
          if (tags.length === 0) {
            append([{ kind: "muted", text: "还没有标签" }]);
            return;
          }
          append([
            { kind: "muted", text: `热门标签 (前 ${tags.length})：` },
            ...tags.map<Line>((t) => ({
              kind: "link",
              text: `  #${t.tag}  (${t.count})`,
              href: `/tags/${encodeURIComponent(t.tag)}`,
            })),
          ]);
          return;
        }
        case "tag": {
          const name2 = args.join(" ").trim();
          if (!name2) {
            append([{ kind: "error", text: "用法：tag <name>" }]);
            return;
          }
          const hit = tags.find((t) => t.tag === name2);
          if (!hit) {
            append([
              { kind: "error", text: `未找到标签 #${name2}` },
              { kind: "muted", text: "→ 输入 tags 查看可用标签" },
            ]);
            return;
          }
          append([
            { kind: "text", text: `跳转到 #${name2} …` },
          ]);
          router.push(`/tags/${encodeURIComponent(name2)}`);
          return;
        }
        case "search":
        case "s": {
          const q = rest.trim();
          if (!q) {
            append([{ kind: "error", text: "用法：search <关键词>" }]);
            return;
          }
          append([{ kind: "text", text: `搜索 "${q}" …` }]);
          router.push(`/search?q=${encodeURIComponent(q)}`);
          return;
        }
        case "random":
        case "rand": {
          if (posts.length === 0) {
            append([{ kind: "muted", text: "没有可用的文章" }]);
            return;
          }
          const p = posts[Math.floor(Math.random() * posts.length)];
          append([{ kind: "text", text: `骰子掷出 → ${p.title}` }]);
          router.push(`/posts/${p.slug}`);
          return;
        }
        case "go":
        case "cd": {
          const target = args[0];
          if (!target) {
            append([{ kind: "error", text: "用法：go <路径>" }]);
            return;
          }
          if (!target.startsWith("/") || !SAFE_PATH.test(target)) {
            append([
              { kind: "error", text: "路径必须以 / 开头，且只含 [\\w-./]" },
            ]);
            return;
          }
          append([{ kind: "text", text: `跳转 ${target}` }]);
          router.push(target);
          return;
        }
        case "theme": {
          const v = (args[0] ?? "").toLowerCase();
          if (v === "light" || v === "l") {
            setTheme("light");
            append([{ kind: "text", text: "已切换 → light" }]);
          } else if (v === "dark" || v === "d") {
            setTheme("dark");
            append([{ kind: "text", text: "已切换 → dark" }]);
          } else if (v === "system" || v === "sys" || v === "auto") {
            setTheme("system");
            append([{ kind: "text", text: "已切换 → system" }]);
          } else if (!v) {
            append([
              {
                kind: "text",
                text: `当前主题：${resolvedTheme ?? "?"}`,
              },
              { kind: "muted", text: "→ theme <light|dark|system>" },
            ]);
          } else {
            append([{ kind: "error", text: `未知主题：${v}` }]);
          }
          return;
        }
        case "music": {
          append([{ kind: "text", text: "打开音乐页 …" }]);
          router.push("/music");
          return;
        }
        case "anime": {
          append([{ kind: "text", text: "打开番剧页 …" }]);
          router.push("/anime");
          return;
        }
        case "games": {
          append([{ kind: "text", text: "打开游戏页 …" }]);
          router.push("/games");
          return;
        }
        case "rss": {
          append([{ kind: "link", text: siteConfig.url + "/rss.xml", href: "/rss.xml" }]);
          return;
        }
        case "repo":
        case "github": {
          append([
            {
              kind: "link",
              text: "GitHub: HyperCharon/hypervoid",
              href: "https://github.com/HyperCharon/hypervoid",
              external: true,
            },
          ]);
          return;
        }
        case "whoami": {
          append([
            me
              ? { kind: "text", text: `@${me} (已登录)` }
              : { kind: "text", text: "guest (未登录)" },
          ]);
          return;
        }
        case "date":
        case "now": {
          append([{ kind: "text", text: new Date().toLocaleString("zh-CN") }]);
          return;
        }
        case "echo": {
          append([{ kind: "text", text: rest || "" }]);
          return;
        }
        case "clear":
        case "cls": {
          clearScreen();
          return;
        }
        case "exit":
        case "quit": {
          append([
            {
              kind: "muted",
              text: "终端不会真的退出 — 关掉标签页或按 Ctrl+W 试试。",
            },
          ]);
          return;
        }
        default: {
          append([
            { kind: "error", text: `未知命令：${name}` },
            { kind: "muted", text: "→ 输入 help 查看可用命令" },
          ]);
        }
      }
    },
    [append, clearScreen, me, posts, router, setTheme, tags, resolvedTheme],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = input;
      setInput("");
      run(cmd);
    },
    [input, run],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
        setHistIdx(next);
        setInput(history[next] ?? "");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < 0) return;
        const next = histIdx + 1;
        if (next >= history.length) {
          setHistIdx(-1);
          setInput("");
        } else {
          setHistIdx(next);
          setInput(history[next] ?? "");
        }
      } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        clearScreen();
      }
    },
    [history, histIdx, clearScreen],
  );

  const promptHandler = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const prompt = useMemo(
    () => (me ? `${me}@hypervoid` : "guest@hypervoid"),
    [me],
  );

  return (
    <section
      aria-label="迷你终端"
      className="hypervoid-terminal hv-panel-sci flex flex-col overflow-hidden"
      onClick={promptHandler}
    >
      <header className="flex items-center gap-2 border-b border-cyan-100/14 bg-cyan-950/24 px-3 py-1.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </span>
        <span className="ml-1 font-mono text-[11px] text-cyan-50/52">
          {prompt}: ~
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearScreen();
          }}
          aria-label="清屏"
          title="清屏 (Ctrl+L)"
          className="ml-auto rounded p-1 text-cyan-50/52 transition hover:bg-cyan-50/8 hover:text-cyan-100"
        >
          <Trash2 className="h-3 w-3" aria-hidden />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="h-[220px] overflow-y-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed"
      >
        {lines.map(({ id, line }) => {
          if (line.kind === "input") {
            return (
              <div key={id} className="flex gap-1.5 text-cyan-50/82">
                <span className="shrink-0 text-cyan-300/80">{">"}</span>
                <span className="break-all">{line.text}</span>
              </div>
            );
          }
          if (line.kind === "muted") {
            return (
              <div key={id} className="break-words text-cyan-50/52">
                {line.text}
              </div>
            );
          }
          if (line.kind === "error") {
            return (
              <div
                key={id}
                className="break-words text-rose-500 dark:text-rose-400"
              >
                {line.text}
              </div>
            );
          }
          if (line.kind === "link") {
            return (
              <div key={id} className="break-words">
                <Link
                  href={line.href}
                  onClick={(e) => e.stopPropagation()}
                  target={line.external ? "_blank" : undefined}
                  rel={line.external ? "noreferrer noopener" : undefined}
                  className="text-cyan-300 hover:text-cyan-100 hover:underline"
                >
                  {line.text}
                </Link>
              </div>
            );
          }
          return (
            <div key={id} className="break-words text-cyan-50/88">
              {line.text}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-1.5 border-t border-cyan-100/14 bg-cyan-950/22 px-3 py-2"
      >
        <span aria-hidden className="font-mono text-xs text-cyan-300/80">
          {">"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(sanitize(e.target.value))}
          onKeyDown={onKeyDown}
          maxLength={MAX_INPUT}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="终端命令输入"
          placeholder="help"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-cyan-50 placeholder:text-cyan-50/42 focus:outline-none"
        />
      </form>
    </section>
  );
}
