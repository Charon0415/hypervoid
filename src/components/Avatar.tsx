"use client";

import { useState } from "react";

export function Avatar({
  src,
  alt,
  name,
  className,
}: {
  src: string;
  alt: string;
  name: string;
  className?: string;
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

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={96}
      height={96}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`${className ?? ""} object-cover`}
    />
  );
}
