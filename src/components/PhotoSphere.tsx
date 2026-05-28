"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
};

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const;

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return (h % 1000) / 1000;
}

function fibonacciSphere(count: number, radius: number) {
  const points: { x: number; y: number; z: number; rotY: number; rotX: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push({
      x: x * radius,
      y: y * radius,
      z: z * radius,
      rotY: (Math.atan2(x, z) * 180) / Math.PI,
      rotX: -(Math.asin(y) * 180) / Math.PI,
    });
  }
  return points;
}

export function PhotoSphere({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const rotX = useMotionValue(15);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 60, damping: 20 });

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    let last = performance.now();
    function tick(now: number) {
      if (autoRotateRef.current && !isDragging.current) {
        const dt = (now - last) / 1000;
        rotY.set(rotY.get() + dt * 12);
      }
      last = now;
      animFrameRef.current = requestAnimationFrame(tick);
    }
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [rotY]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      autoRotateRef.current = false;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotY.set(rotY.get() + dx * 0.4);
      rotX.set(Math.max(-60, Math.min(60, rotX.get() - dy * 0.3)));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    },
    [rotX, rotY],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setTimeout(() => {
      autoRotateRef.current = true;
    }, 3000);
  }, []);

  const [radius, setRadius] = useState(280);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setRadius((r) => Math.max(160, Math.min(500, r - e.deltaY * 0.5)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

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

  const points = fibonacciSphere(photos.length, radius);
  const cardW = photos.length <= 8 ? 130 : photos.length <= 20 ? 100 : 80;
  const cardH = cardW * 0.75;

  // generate wireframe dots on sphere
  const wireDots: { x: number; y: number; z: number }[] = [];
  const wireDotCount = 60;
  for (let i = 0; i < wireDotCount; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / wireDotCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    wireDots.push({
      x: Math.sin(phi) * Math.cos(theta) * radius,
      y: Math.cos(phi) * radius,
      z: Math.sin(phi) * Math.sin(theta) * radius,
    });
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative mx-auto flex h-[70vh] cursor-grab items-center justify-center active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ perspective: 1200, perspectiveOrigin: "50% 50%" }}
      >
        {/* center glow */}
        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />

        <motion.div
          style={{
            rotateX: springX,
            rotateY: springY,
            transformStyle: "preserve-3d",
            width: 0,
            height: 0,
          }}
        >
          {/* wireframe dots */}
          {wireDots.map((d, i) => (
            <div
              key={`dot-${i}`}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: 3,
                height: 3,
                left: -1.5,
                top: -1.5,
                transform: `translate3d(${d.x}px, ${d.y}px, ${d.z}px)`,
                backfaceVisibility: "hidden",
              }}
            />
          ))}

          {/* wireframe ring lines (CSS circles at different angles) */}
          {[0, 60, 120].map((angle) => (
            <div
              key={`ring-${angle}`}
              className="absolute rounded-full border border-primary/[0.07]"
              style={{
                width: radius * 2,
                height: radius * 2,
                left: -radius,
                top: -radius,
                transform: `rotateX(${angle}deg)`,
                backfaceVisibility: "hidden",
              }}
            />
          ))}

          {/* photo cards */}
          {photos.map((photo, i) => {
            const p = points[i];
            const rotation = (seededRandom(photo.id) - 0.5) * 4;
            return (
              <div
                key={photo.id}
                className="absolute group/card"
                style={{
                  width: cardW,
                  height: cardH,
                  left: -cardW / 2,
                  top: -cardH / 2,
                  transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${p.rotY}deg) rotateX(${p.rotX}deg)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(photo)}
                  className="block size-full overflow-hidden rounded-lg border border-white/10 shadow-lg transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:shadow-primary/20 hover:shadow-xl"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    width={280}
                    height={210}
                    className="size-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/card:bg-black/40 group-hover/card:opacity-100">
                    <svg
                      className="h-5 w-5 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </button>
                {photo.caption && (
                  <div className="absolute inset-x-0 -bottom-5 text-center text-[10px] text-white/50 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    {photo.caption}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/30">
          拖拽旋转 · 滚轮缩放 · 点击查看
        </div>
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

  const dragX = useMotionValue(0);
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (info.offset.x > 80 || info.velocity.x > 400) goPrev();
      else if (info.offset.x < -80 || info.velocity.x < -400) goNext();
    },
    [goPrev, goNext],
  );

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="absolute top-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/8 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-md ring-1 ring-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <span className="tabular-nums">{idx + 1}</span>
        <span className="text-white/30">/</span>
        <span className="tabular-nums">{photos.length}</span>
      </motion.div>

      <motion.div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 340 }}
      >
        {hasPrev && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="上一张"
            className="absolute -left-14 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/8 text-white/70 ring-1 ring-white/10 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/15 hover:text-white sm:-left-16"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -50 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
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

        {photo.caption && (
          <motion.p
            className="absolute -bottom-12 left-0 right-0 text-center text-sm text-white/50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {photo.caption}
          </motion.p>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={goNext}
            aria-label="下一张"
            className="absolute -right-14 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/8 text-white/70 ring-1 ring-white/10 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/15 hover:text-white sm:-right-16"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}

        <motion.div
          className="absolute -bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/8 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-md"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></svg>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
