"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MascotChat } from "@/components/MascotChat";
import { buildRemSetupPose, type RemDrawable, type RemSetupPose } from "@/lib/rem-spine36";

const STORAGE_KEY = "hypervoid:mascot";
const MASCOT_W = 240;
const MASCOT_H = 300;

const SPINE_ATLAS = "/mascot/rem/1.atlas";
const SPINE_SKEL = "/mascot/rem/1.skel";
const SPINE_IMAGE = "/mascot/rem/1.png";
const CANVAS_W = 240;
const CANVAS_H = 300;

async function readAssetText(src: string): Promise<string> {
  const res = await fetch(src, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error("failed to load " + src + ": " + res.status);
  }
  return res.text();
}

async function readAssetBytes(src: string): Promise<Uint8Array> {
  const res = await fetch(src, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error("failed to load " + src + ": " + res.status);
  }
  return new Uint8Array(await res.arrayBuffer());
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("failed to load " + src));
    image.src = src;
  });
}

type CanvasPoint = { x: number; y: number };

function drawRemDrawable(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  drawable: RemDrawable,
  setupPose: RemSetupPose,
  scale: number,
  originX: number,
  originY: number,
) {
  const [br, bl, ul, ur] = projectVertices(
    drawable.vertices,
    setupPose,
    scale,
    originX,
    originY,
  );
  const region = drawable.region;

  ctx.save();
  ctx.globalAlpha *= drawable.alpha;
  if (region.rotate) {
    drawImageAffine(ctx, image, region.x, region.y, region.width, region.height, br, bl, ur);
  } else {
    drawImageAffine(ctx, image, region.x, region.y, region.width, region.height, ul, ur, bl);
  }
  ctx.restore();
}

function projectVertices(
  vertices: RemDrawable["vertices"],
  setupPose: RemSetupPose,
  scale: number,
  originX: number,
  originY: number,
): [CanvasPoint, CanvasPoint, CanvasPoint, CanvasPoint] {
  const points: CanvasPoint[] = [];
  for (let i = 0; i < vertices.length; i += 2) {
    points.push({
      x: originX + (vertices[i] - setupPose.bounds.minX) * scale,
      y: originY + (setupPose.bounds.maxY - vertices[i + 1]) * scale,
    });
  }
  return points as [CanvasPoint, CanvasPoint, CanvasPoint, CanvasPoint];
}

function drawImageAffine(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  topLeft: CanvasPoint,
  topRight: CanvasPoint,
  bottomLeft: CanvasPoint,
) {
  ctx.save();
  ctx.transform(
    (topRight.x - topLeft.x) / sw,
    (topRight.y - topLeft.y) / sw,
    (bottomLeft.x - topLeft.x) / sh,
    (bottomLeft.y - topLeft.y) / sh,
    topLeft.x,
    topLeft.y,
  );
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.restore();
}

const MESSAGES = {
  tap: [
    "主人，有什么吩咐吗？",
    "雷姆在这里呢。",
    "主人，请不要乱碰……",
    "有什么可以帮您的吗？",
    "主人，今天也要加油呢。",
    "雷姆会一直陪着主人的。",
  ],
  idle: [
    "主人，休息一下吧。",
    "雷姆在呢，主人。",
    "今天也要努力呢。",
    "主人，要喝水吗？",
  ],
} as const;

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function isGifMascotEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (isMobileViewport()) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return raw === "true";
    return document.documentElement.getAttribute("data-bg") === "acg";
  } catch {
    return false;
  }
}

export function setGifMascotEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(
      new CustomEvent("hypervoid:mascot-changed", { detail: enabled }),
    );
  } catch {
    /* noop */
  }
}

type Pos = { x: number; y: number };

function clampPos(p: Pos): Pos {
  if (typeof window === "undefined") return p;
  const maxX = Math.max(0, window.innerWidth - MASCOT_W);
  const maxY = Math.max(0, window.innerHeight - MASCOT_H);
  return {
    x: Math.min(Math.max(0, p.x), maxX),
    y: Math.min(Math.max(0, p.y), maxY),
  };
}

function defaultPos(): Pos {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return clampPos({
    x: window.innerWidth - MASCOT_W - 16,
    y: window.innerHeight - MASCOT_H - 16,
  });
}

export function GifMascot() {
  const pathname = usePathname();
  const onStrictRoute =
    pathname?.startsWith("/admin") || pathname === "/search";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragOffsetRef = useRef<Pos>({ x: 0, y: 0 });
  const dragStartRef = useRef<Pos>({ x: 0, y: 0 });
  const draggedRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    if (isGifMascotEnabled()) setVisible(true);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (visible && pos === null) setPos(defaultPos());
  }, [visible, pos]);

  useEffect(() => {
    function onResize() {
      setPos((p) => (p ? clampPos(p) : p));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const enabled = (e as CustomEvent<boolean>).detail;
      setVisible(enabled);
      if (!enabled) setDialog(null);
    };
    window.addEventListener("hypervoid:mascot-changed", handler);
    return () =>
      window.removeEventListener("hypervoid:mascot-changed", handler);
  }, []);

  const showDialog = useCallback((msg: string) => {
    setDialog(msg);
    if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
    dialogTimerRef.current = setTimeout(() => setDialog(null), 3500);
  }, []);

  const scheduleIdle = useCallback(function queueIdle() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => {
        const msgs = MESSAGES.idle;
        showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
        queueIdle();
      },
      30000 + Math.random() * 60000,
    );
  }, [showDialog]);

  useEffect(() => {
    if (!visible || mobile || onStrictRoute) return;
    let disposed = false;
    setLoadError(null);
    scheduleIdle();

    let frameId = 0;

    (async () => {
      try {
        const [atlasText, skeletonBytes, image] = await Promise.all([
          readAssetText(SPINE_ATLAS),
          readAssetBytes(SPINE_SKEL),
          loadImage(SPINE_IMAGE),
        ]);
        if (disposed || !canvasRef.current) return;

        const setupPose = buildRemSetupPose(skeletonBytes, atlasText);
        const canvas = canvasRef.current;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = CANVAS_W * dpr;
        canvas.height = CANVAS_H * dpr;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2d canvas unavailable");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const poseW = setupPose.bounds.maxX - setupPose.bounds.minX;
        const poseH = setupPose.bounds.maxY - setupPose.bounds.minY;
        const scale = Math.min(CANVAS_W / poseW, CANVAS_H / poseH) * 0.94;
        const originX = (CANVAS_W - poseW * scale) / 2;
        const originY = (CANVAS_H - poseH * scale) / 2 + 8;

        const draw = (time: number) => {
          if (disposed) return;
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          const bob = Math.sin(time / 900) * 2;
          ctx.save();
          ctx.translate(0, bob);
          for (const drawable of setupPose.drawables) {
            drawRemDrawable(ctx, image, drawable, setupPose, scale, originX, originY);
          }
          ctx.restore();
          frameId = window.requestAnimationFrame(draw);
        };

        frameId = window.requestAnimationFrame(draw);
      } catch (e) {
        console.warn("[mascot/rem-spine36] load failed:", e);
        setLoadError("雷姆模型加载失败");
      }
    })();

    return () => {
      disposed = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [visible, mobile, onStrictRoute, scheduleIdle]);

  const show = useCallback(() => {
    setGifMascotEnabled(true);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setGifMascotEnabled(false);
    setVisible(false);
    setDialog(null);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pos) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, textarea, select, [data-no-drag]"))
        return;
      dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      draggedRef.current = false;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (!draggedRef.current && dx * dx + dy * dy > 16) {
        draggedRef.current = true;
      }
      setPos(
        clampPos({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y,
        }),
      );
    },
    [dragging],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      if (!draggedRef.current) {
        const target = e.target as HTMLElement;
        if (!target.closest("button, a, input, textarea, select, [data-no-drag]")) {
          const msgs = MESSAGES.tap;
          showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
        }
      }
    },
    [dragging, showDialog],
  );

  if (!mounted || mobile || onStrictRoute) return null;

  return (
    <>
      {!visible && (
        <button
          type="button"
          onClick={show}
          aria-label="呼出看板娘"
          title="呼出看板娘"
          style={{
            bottom: "max(5.25rem, env(safe-area-inset-bottom, 0px) + 4.75rem)",
            right: "max(1.5rem, env(safe-area-inset-right, 0px) + 1rem)",
          }}
          className="group fixed z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-muted shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:border-primary/60 hover:text-primary hover:shadow-xl"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/0 transition group-hover:bg-primary/5"
          />
          <svg
            className="relative h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 11a7 7 0 1 1 14 0v3.5a2.5 2.5 0 0 1-5 0V12" />
            <path d="M5 11v3.5a2.5 2.5 0 0 0 5 0V12" />
            <circle cx="9" cy="11" r="0.6" fill="currentColor" stroke="none" />
            <circle cx="15" cy="11" r="0.6" fill="currentColor" stroke="none" />
            <path d="M10.5 14.5c.4.4 1 .6 1.5.6s1.1-.2 1.5-.6" />
          </svg>
        </button>
      )}

      {visible && pos && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="group/mascot fixed z-[999] touch-none select-none"
          style={{
            left: pos.x,
            top: pos.y,
            width: MASCOT_W,
            height: MASCOT_H,
            cursor: dragging ? "grabbing" : "grab",
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="收起看板娘"
            title="收起 · 还可在站点设置中重新打开"
            className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-base font-medium text-muted opacity-0 shadow-md transition-all duration-150 hover:border-primary hover:text-primary group-hover/mascot:opacity-100 focus-visible:opacity-100"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setChatOpen((v) => !v)}
            aria-label={chatOpen ? "收起对话" : "和雷姆说话"}
            title={chatOpen ? "收起对话" : "和雷姆说话"}
            className={`absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted opacity-0 shadow-md transition-all duration-150 hover:border-primary hover:text-primary group-hover/mascot:opacity-100 focus-visible:opacity-100 ${
              chatOpen ? "!opacity-100" : ""
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>

          {chatOpen ? (
            <div
              data-no-drag
              className="absolute right-full top-0 z-10 mr-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MascotChat
                character="rem"
                onClose={() => setChatOpen(false)}
              />
            </div>
          ) : null}

          {!chatOpen && dialog ? (
            <div className="absolute -top-2 left-1/2 max-w-[200px] -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg">
              {dialog}
              <span
                aria-hidden
                className="absolute left-1/2 top-full -ml-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-r border-border bg-card"
              />
            </div>
          ) : null}

          {loadError ? (
            <div className="pointer-events-none flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/80 px-4 text-center text-xs leading-relaxed text-muted shadow-lg backdrop-blur">
              {loadError}
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              aria-label="雷姆"
              role="img"
              className={`pointer-events-none h-full w-full transition-transform duration-200 ${
                dragging ? "scale-[0.98]" : ""
              }`}
            />
          )}
        </div>
      )}
    </>
  );
}
