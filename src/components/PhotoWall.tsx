"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

// seeded random per photo for consistent rotation
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return (h % 100) / 100;
}

export function PhotoWall({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const idx = photos.findIndex((p) => p.id === lightbox.id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && idx < photos.length - 1)
        setLightbox(photos[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) setLightbox(photos[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos]);

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <PhotoCard key={p.id} photo={p} index={i} onClick={setLightbox} />
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photo={lightbox}
            photos={photos}
            onClose={() => setLightbox(null)}
            onNavigate={setLightbox}
          />
        )}
      </AnimatePresence>
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
  const cardRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const rotation = seededRandom(photo.id) * 6 - 3; // -3 to +3 degrees
  const isLarge = index % 5 === 0; // every 5th photo is featured

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y],
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onClick(photo)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800 }}
      className="group/card relative mb-4 w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card text-left"
      initial={{ opacity: 0, y: 40, rotate: rotation, filter: "grayscale(100%) brightness(1.1)" }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotate: rotation,
        filter: "grayscale(0%) brightness(1)",
      }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.7,
        delay: Math.min(index * 0.08, 0.6),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.03,
        rotate: 0,
        zIndex: 10,
        transition: { duration: 0.3 },
      }}
    >
      {/* image */}
      <div className="relative overflow-hidden">
        <Image
          src={photo.url}
          alt={photo.caption ?? ""}
          width={isLarge ? 960 : 640}
          height={isLarge ? 720 : 480}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          loading="lazy"
          className="w-full object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:brightness-110"
        />

        {/* gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

        {/* clip-path reveal border */}
        <div
          className="absolute inset-0 border-2 border-white/30 opacity-0 transition-all duration-500 group-hover/card:opacity-100"
          style={{ clipPath: "inset(0 round 12px)" }}
        />

        {/* caption */}
        {photo.caption ? (
          <motion.p
            className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-10 text-sm font-medium text-white"
            initial={false}
            animate={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {photo.caption}
          </motion.p>
        ) : null}

        {/* corner decoration */}
        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white/0 transition-all duration-300 group-hover/card:bg-white/60 group-hover/card:shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </div>

      {/* bottom glow */}
      <div className="absolute -bottom-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover/card:via-primary/50" />
    </motion.button>
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

  // drag to navigate
  const dragX = useMotionValue(0);
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 80;
      if (info.offset.x > threshold || info.velocity.x > 400) goPrev();
      else if (info.offset.x < -threshold || info.velocity.x < -400) goNext();
    },
    [goPrev, goNext],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* counter */}
      <motion.div
        className="absolute top-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {idx + 1} / {photos.length}
      </motion.div>

      <motion.div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
      >
        {/* prev */}
        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute -left-14 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur transition-all hover:scale-110 hover:bg-white/20 hover:text-white sm:-left-16"
            aria-label="上一张"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

        {/* draggable image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            initial={{ opacity: 0, scale: 0.92, x: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: -60 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="cursor-grab active:cursor-grabbing"
          >
            <Image
              src={photo.url}
              alt={photo.caption ?? ""}
              width={1600}
              height={1200}
              className="max-h-[82vh] rounded-xl object-contain shadow-2xl select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* caption */}
        <AnimatePresence mode="wait">
          {photo.caption && (
            <motion.p
              key={photo.caption}
              className="absolute -bottom-12 left-0 right-0 text-center text-sm text-white/70"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
            >
              {photo.caption}
            </motion.p>
          )}
        </AnimatePresence>

        {/* next */}
        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            className="absolute -right-14 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur transition-all hover:scale-110 hover:bg-white/20 hover:text-white sm:-right-16"
            aria-label="下一张"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-12 -top-12 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
          aria-label="关闭"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>
        </button>
      </motion.div>
    </motion.div>
  );
}
