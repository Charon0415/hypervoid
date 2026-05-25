"use client";

import Image from "next/image";
import { useState } from "react";

export function Avatar({
  src,
  alt,
  name,
  className,
  size = 96,
}: {
  src: string;
  alt: string;
  name: string;
  className?: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className ?? ""} grid place-items-center bg-primary/15 text-2xl font-bold text-primary`}
      >
        {initial}
      </div>
    );
  }

  // next/image auto-serves WebP/AVIF and emits a responsive srcset for
  // hosts allow-listed in next.config.ts. For arbitrary external hosts
  // (e.g. friend-link avatars on random domains) we drop optimization
  // and let the browser fetch the original — still better than a raw
  // <img> because we keep the error fallback, lazy loading, and sizes.
  const isArbitraryHost = /^https?:\/\//i.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      loading="lazy"
      unoptimized={isArbitraryHost}
      onError={() => setErrored(true)}
      className={`${className ?? ""} object-cover`}
    />
  );
}
