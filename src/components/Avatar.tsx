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

  // next/image auto-serves WebP/AVIF and emits a responsive srcset.
  // External hosts (avatars hosted on github/etc) need to be allow-listed
  // in next.config.ts, so we fall back to plain <img> for those.
  if (/^https?:\/\//i.test(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setErrored(true)}
        className={`${className ?? ""} object-cover`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`${className ?? ""} object-cover`}
    />
  );
}
