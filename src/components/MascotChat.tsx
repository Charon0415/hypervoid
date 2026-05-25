"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "hypervoid:mascot-chat";
const MAX_HISTORY = 12;

export type ChatMessage = { role: "user" | "assistant"; content: string };

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          m && (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    /* noop */
  }
}

export function MascotChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, partial]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(next);
    saveHistory(next);
    setInput("");
    setStreaming(true);
    setPartial("");

    try {
      const res = await fetch("/api/mascot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        const errBody = await res.text();
        const errMsg = errBody.startsWith("{")
          ? (() => {
              try {
                return JSON.parse(errBody).error ?? "出错了";
              } catch {
                return "出错了";
              }
            })()
          : errBody || "出错了";
        const fail: ChatMessage = {
          role: "assistant",
          content: `……（${errMsg}）`,
        };
        const after = [...next, fail];
        setMessages(after);
        saveHistory(after);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setPartial(acc);
      }
      const reply: ChatMessage = { role: "assistant", content: acc || "……" };
      const after = [...next, reply];
      setMessages(after);
      saveHistory(after);
      setPartial("");
    } catch (e) {
      console.error("[mascot-chat]", e);
      const fail: ChatMessage = {
        role: "assistant",
        content: "……（卡姆依走神了）",
      };
      const after = [...next, fail];
      setMessages(after);
      saveHistory(after);
    } finally {
      setStreaming(false);
    }
  };

  const clear = () => {
    setMessages([]);
    saveHistory([]);
    setPartial("");
  };

  return (
    <div className="flex h-[320px] w-[260px] flex-col rounded-2xl border border-border bg-card text-foreground shadow-2xl">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs">
        <span className="font-semibold">和康娜说话</span>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="rounded-md px-1.5 py-0.5 text-[10px] text-muted hover:bg-background hover:text-foreground"
              title="清空对话"
            >
              清空
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭对话"
            className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 text-sm leading-relaxed"
      >
        {messages.length === 0 && !partial ? (
          <p className="text-xs text-muted">康娜在偷瞄你…说点什么吧。</p>
        ) : null}
        <ul className="flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <li
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[80%] rounded-2xl px-2.5 py-1.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/15 text-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                {m.content}
              </span>
            </li>
          ))}
          {partial ? (
            <li className="flex justify-start">
              <span className="max-w-[80%] rounded-2xl bg-background px-2.5 py-1.5 text-xs leading-relaxed text-foreground">
                {partial}
                <span className="ml-0.5 inline-block h-2 w-1 animate-pulse bg-primary align-middle" />
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-1.5 border-t border-border p-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={streaming}
          placeholder="说点什么…"
          maxLength={400}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none transition focus:border-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="shrink-0 whitespace-nowrap rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {streaming ? "…" : "发送"}
        </button>
      </form>
    </div>
  );
}
