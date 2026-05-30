"use client";

import { useState, useTransition } from "react";
import { postGuestbookAction } from "@/app/guestbook/actions";

export function GuestbookForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await postGuestbookAction(formData);
        setMessage("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <textarea
        name="message"
        rows={4}
        required
        maxLength={1000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="留下一句话…"
        className="hv-input w-full px-3 py-2 text-sm"
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
      />
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-cyan-50/58">{message.length} / 1000</span>
        <button
          type="submit"
          disabled={pending || !message.trim()}
          className="hv-action px-4 py-1.5 text-sm font-medium disabled:opacity-50"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
        >
          {pending ? "发送中…" : "发送"}
        </button>
      </div>
    </form>
  );
}
