"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MascotChat } from "@/components/MascotChat";

const STORAGE_KEY = "hypervoid:mascot";
const MASCOT_W = 240;
const MASCOT_H = 300;

const SPINE_SKEL = "/mascot/rem/1.skel";
const SPINE_ATLAS = "/mascot/rem/1.atlas";
const CANVAS_W = 240;
const CANVAS_H = 300;
const SPINE_DATA_KEY = "hypervoid-rem-spine-data";
const SPINE_ATLAS_KEY = "hypervoid-rem-spine-atlas";

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
  const appRef = useRef<unknown>(null);
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

    (async () => {
      try {
        const PIXI = await import("pixi.js");
        await import("@esotericsoftware/spine-pixi-v7");
        const { Spine, SetupPoseBoundsProvider } = await import(
          "@esotericsoftware/spine-pixi-v7"
        );

        if (disposed || !canvasRef.current) return;

        const app = new PIXI.Application({
          view: canvasRef.current,
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
        });
        appRef.current = app;

        try {
          PIXI.Assets.add(SPINE_DATA_KEY, SPINE_SKEL);
        } catch {
          /* asset already registered */
        }
        try {
          PIXI.Assets.add(SPINE_ATLAS_KEY, SPINE_ATLAS);
        } catch {
          /* asset already registered */
        }
        await PIXI.Assets.load([SPINE_DATA_KEY, SPINE_ATLAS_KEY]);
        if (disposed) return;

        const model = Spine.from({
          skeleton: SPINE_DATA_KEY,
          atlas: SPINE_ATLAS_KEY,
          autoUpdate: true,
          ticker: app.ticker,
          boundsProvider: new SetupPoseBoundsProvider(false),
        });

        const animations = model.skeleton.data.animations.map((a) => a.name);
        const idle =
          animations.find((name) => /idle|wait|stand|loop/i.test(name)) ??
          animations[0];
        if (idle) model.state.setAnimation(0, idle, true);

        model.update(0);
        const bounds = model.getLocalBounds();
        const scale =
          bounds.width > 0 && bounds.height > 0
            ? Math.min(CANVAS_W / bounds.width, CANVAS_H / bounds.height) * 0.92
            : 1;
        model.scale.set(scale);
        model.x = CANVAS_W / 2 - (bounds.x + bounds.width / 2) * scale;
        model.y = CANVAS_H / 2 - (bounds.y + bounds.height / 2) * scale;

        app.stage.addChild(model);
      } catch (e) {
        console.warn("[mascot/rem-spine] load failed:", e);
        setLoadError("雷姆模型加载失败");
      }
    })();

    return () => {
      disposed = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
      const app = appRef.current as {
        destroy?: (removeView: boolean, stageOptions: unknown) => void;
      } | null;
      try {
        app?.destroy?.(true, { children: true, texture: true });
      } catch {
        /* noop */
      }
      appRef.current = null;
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
