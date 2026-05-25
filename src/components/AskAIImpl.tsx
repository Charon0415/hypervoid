"use client";

import { useState } from "react";

export function AskAIImpl({ slug }: { slug: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setAnswer("");
    setError(null);

    try {
      const res = await fetch(`/api/posts/${slug}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `请求失败 (${res.status})`);
      }

      if (!res.body) throw new Error("响应没有 body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnswer((prev) => prev + chunk);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">问问 AI ✦</h3>
        <span className="text-xs text-muted">基于这篇文章回答</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Claude Haiku 会基于这篇文章的内容回答你的问题。回答仅供参考，可能与作者本人观点不同。
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="比如：这套技术栈的成本怎样？为什么选 Postgres 而不是 SQLite？"
          rows={2}
          maxLength={500}
          disabled={loading}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{question.length} / 500</span>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "思考中…" : "提问"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-3 rounded-md border border-red-400/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {answer ? (
        <div className="mt-4 rounded-md border border-border bg-background p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">
            AI 回答
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </div>
      ) : null}
    </div>
  );
}
