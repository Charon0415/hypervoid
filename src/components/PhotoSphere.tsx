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

/* ── fibonacci sphere distribution ── */
function fibonacciSphere(count: number, radius: number) {
  const points: { x: number; y: number; z: number; rotY: number; rotX: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
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

/* ── main component ── */
export function PhotoSphere({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // drag rotation
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 60, damping: 20 });

  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const animFrameRef = useRef<number>(0);

  // auto rotation
  useEffect(() => {
    let last = performance.now();
    function tick(now: number) {
      if (autoRotateRef.current && !isDragging.current) {
        const dt = (now - last) / 1000;
        rotY.set(rotY.get() + dt * 12); // 12 deg/s
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
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
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
    // resume auto-rotate after 3s idle
    setTimeout(() => {
      autoRotateRef.current = true;
    }, 3000);
  }, []);

  // scroll to zoom
  const [radius, setRadius] = useState(320);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setRadius((r) => Math.max(180, Math.min(600, r - e.deltaY * 0.5)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // keyboard nav
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
  const cardW = photos.length <= 8 ? 140 : photos.length <= 20 ? 110 : 90;
  const cardH = cardW * 0.75;

  return (
    <>
      {/* grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[998] opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        ref={containerRef}
        className="relative mx-auto flex h-[70vh] cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
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
          {photos.map((photo, i) => {
            const p = points[i];
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
                  {/* hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover/card:bg-black/40 group-hover/card:opacity-100">
                    <svg
                      className="h-6 w-6 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                </button>
                {/* caption on hover */}
                {photo.caption && (
                  <div className="absolute inset-x-0 -bottom-6 text-center text-xs text-white/50 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    {photo.caption}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* instruction hint */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/30">
          拖拽旋转 · 滚轮缩放 · 点击查看
        </div>
      </div>

      {/* lightbox */}
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

/* ── lightbox (shared with PhotoWall) ── */
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
      aria-label="照片预览"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/85"
        style={{ backdropFilter: "blur(12px)" }}
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
            <span className="sr-only">上一张</span>
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
            <span className="sr-only">下一张</span>
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
            <span className="sr-only">关闭</span>
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
