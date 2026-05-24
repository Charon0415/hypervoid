"use client";

import { useState } from "react";

type Props = {
  title: string;
  url: string;
};

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard blocked */
      });
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const xHref = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const weiboHref = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;

  return (
    <div className="inline-flex items-center gap-1">
      <ActionButton onClick={copy} label={copied ? "已复制" : "复制链接"}>
        {copied ? <CheckIcon /> : <LinkIcon />}
      </ActionButton>
      <ActionLink href={xHref} label="分享到 X / Twitter">
        <XIcon />
      </ActionLink>
      <ActionLink href={weiboHref} label="分享到微博">
        <WeiboIcon />
      </ActionLink>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:border-primary/40 hover:text-primary"
    >
      {children}
    </button>
  );
}

function ActionLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:border-primary/40 hover:text-primary"
    >
      {children}
    </a>
  );
}



function LinkIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WeiboIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.098 20.323c-3.977.39-7.414-1.4-7.673-4.002-.26-2.6 2.752-5.028 6.73-5.42 3.975-.39 7.414 1.4 7.672 4.002.26 2.6-2.752 5.027-6.73 5.42zm-1.5-3.71a2.32 2.32 0 0 1-.34-2.27c.36-.91 1.42-1.59 2.36-1.5.94.08 1.42 1.04 1.05 1.95-.36.91-1.42 1.6-2.36 1.51-.27-.03-.51-.13-.71-.27v.58zm.21-2.85c.18-.31.56-.5.86-.43.3.07.43.4.25.7-.18.31-.56.5-.86.43-.3-.07-.43-.39-.25-.7zM20.61 8.83c-.38-.43-.95-.6-1.48-.46l.01.01a.749.749 0 0 0-.5.92c.11.4.52.63.92.52.36-.1.74.04.96.34.22.3.21.7.01.99l-.01.01a.748.748 0 1 0 1.21.88c.6-.85.62-2.04-.12-2.86zM19.45 6.43a4.16 4.16 0 0 0-3.97-1.23.901.901 0 0 0-.68 1.08c.11.48.6.79 1.08.69a2.36 2.36 0 0 1 2.25.7 2.34 2.34 0 0 1 .47 2.31.913.913 0 0 0 .58 1.14c.47.16.99-.1 1.14-.58a4.16 4.16 0 0 0-.87-4.11zM16.36 9.91c-.13-.04-.22-.16-.18-.36.07-.4-.13-.81-.5-.99-.37-.18-.81-.07-1.06.24-.13.16-.31.18-.46.06-.41-.33-.96-.18-1.18.32-.05.11-.16.18-.28.16-.49-.07-.97.27-1.05.77-.02.13-.13.22-.26.21-.41-.04-.78.25-.84.66-.07.45.24.86.69.93.13.02.22.13.21.26-.04.4.24.78.65.84.45.07.86-.24.93-.69.02-.13.13-.22.26-.21.41.04.78-.25.84-.66.02-.13.13-.22.26-.21.41.04.78-.25.84-.66.02-.13.13-.22.26-.21.45.07.86-.24.93-.69.05-.31-.12-.59-.36-.74z" />
    </svg>
  );
}
