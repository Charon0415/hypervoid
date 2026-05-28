"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

export function PhotoWall({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  // close on Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // navigate lightbox with arrow keys
  useEffect(() => {
    if (!lightbox) return;
    const idx = photos.findIndex((p) => p.id === lightbox.id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && idx < photos.length - 1)
        setLightbox(photos[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) setLightbox(photos[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <PhotoCard key={p.id} photo={p} index={i} onClick={setLightbox} />
        ))}
      </div>

      {lightbox && (
        <Lightbox
          photo={lightbox}
          photos={photos}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </>
  );
}

function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: Photo;
  index: number;
  onClick: (p: Photo) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onClick(photo)}
      className={`group mb-3 w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-left transition-all duration-500 hover:border-primary hover:shadow-lg hover:shadow-primary/10 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <div className="relative overflow-hidden">
        <Image
          src={photo.url}
          alt={photo.caption ?? ""}
          width={640}
          height={480}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {photo.caption ? (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-8 text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
            {photo.caption}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function Lightbox({
  photo,
  photos,
  onClose,
  onNavigate,
}: {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (p: Photo) => void;
}) {
  const idx = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = idx > 0;
  const hasNext = idx < photos.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(photos[idx - 1]);
  }, [hasPrev, idx, onNavigate, photos]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(photos[idx + 1]);
  }, [hasNext, idx, onNavigate, photos]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* prev */}
        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute -left-12 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:-left-14 sm:h-12 sm:w-12"
            aria-label="上一张"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

        {/* image */}
        <Image
          key={photo.id}
          src={photo.url}
          alt={photo.caption ?? ""}
          width={1600}
          height={1200}
          className="max-h-[85vh] rounded-lg object-contain shadow-2xl"
        />

        {/* caption */}
        {photo.caption && (
          <p className="absolute -bottom-10 left-0 right-0 text-center text-sm text-white/80">
            {photo.caption}
          </p>
        )}

        {/* next */}
        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            className="absolute -right-12 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:-right-14 sm:h-12 sm:w-12"
            aria-label="下一张"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-10 -top-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="关闭"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>
        </button>
      </div>
    </div>
  );
}
