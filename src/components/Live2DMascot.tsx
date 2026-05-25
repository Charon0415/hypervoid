"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "hypervoid:mascot";
const DEFAULT_MODEL = "/live2d/haru01/haru01.model.json";
const CUBISM2_RUNTIME = "/live2d/live2d.min.js";
const MASCOT_W = 220;
const MASCOT_H = 260;
const CANVAS_W = 200;
const CANVAS_H = 250;

function loadCubism2Runtime(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  const w = window as unknown as { Live2D?: unknown };
  if (w.Live2D) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-cubism2-runtime]",
    );
    if (existing) {
      if ((window as unknown as { Live2D?: unknown }).Live2D) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("script error")),
          { once: true },
        );
      }
      return;
    }
    const s = document.createElement("script");
    s.src = CUBISM2_RUNTIME;
    s.async = true;
    s.dataset.cubism2Runtime = "true";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script error"));
    document.head.appendChild(s);
  });
}

const MESSAGES = {
  tap: [
    "呀！别碰我~",
    "有什么事吗？",
    "欢迎来到 Hypervoid~",
    "今天过得怎么样？",
    "你戳到我了！",
    "在看文章吗？",
  ],
  idle: [
    "好久不见~",
    "今天也要开心哦",
    "记得常来看看",
    "这里有很多有趣的文章",
  ],
} as const;

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function isMascotEnabled(): boolean {
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

export function setMascotEnabled(enabled: boolean) {
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

export function Live2DMascot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<unknown>(null);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragOffsetRef = useRef<Pos>({ x: 0, y: 0 });

  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    if (isMascotEnabled()) setVisible(true);
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

  const scheduleIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => {
        const msgs = MESSAGES.idle;
        showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
        scheduleIdle();
      },
      30000 + Math.random() * 60000,
    );
  }, [showDialog]);

  useEffect(() => {
    if (!visible || mobile) return;
    let disposed = false;
    setLoadError(null);

    (async () => {
      try {
        const PIXI = await import("pixi.js");
        const w = window as unknown as { PIXI?: unknown };
        if (!w.PIXI) w.PIXI = PIXI;

        await loadCubism2Runtime();

        const { Live2DModel } = await import("pixi-live2d-display/cubism2");

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
          const model = await Live2DModel.from(DEFAULT_MODEL, {
            autoInteract: false,
          });
          if (disposed) return;

          const scale =
            Math.min(CANVAS_W / model.width, CANVAS_H / model.height) * 0.85;
          model.scale.set(scale);
          model.anchor.set(0.5, 0.5);
          model.x = CANVAS_W / 2;
          model.y = CANVAS_H * 0.55;

          model.on("pointertap", () => {
            const msgs = MESSAGES.tap;
            showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
          });
          model.eventMode = "static";
          model.cursor = "grab";

          app.stage.addChild(model);
          scheduleIdle();
        } catch (e) {
          console.warn("[mascot] model load failed:", e);
          setLoadError("看板娘模型加载失败");
        }
      } catch (e) {
        console.warn("[mascot] init failed:", e);
        setLoadError("看板娘初始化失败");
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
  }, [visible, mobile, scheduleIdle, showDialog]);

  const show = useCallback(() => {
    setMascotEnabled(true);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setMascotEnabled(false);
    setVisible(false);
    setDialog(null);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pos) return;
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;
      dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
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
    },
    [dragging],
  );

  if (!mounted || mobile) return null;

  return (
    <>
      {!visible && (
        <button
          type="button"
          onClick={show}
          className="fixed bottom-4 right-4 z-[998] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted shadow-lg transition hover:border-primary hover:text-primary hover:shadow-xl"
          aria-label="开启看板娘"
          title="看板娘"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
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
            className="absolute right-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs text-muted shadow-sm transition hover:border-primary hover:text-primary"
            aria-label="关闭看板娘"
            title="关闭"
          >
            ×
          </button>

          {(dialog || loadError) && (
            <div className="absolute -top-2 left-1/2 max-w-[200px] -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg">
              {loadError ?? dialog}
              <span
                aria-hidden
                className="absolute left-1/2 top-full -ml-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-r border-border bg-card"
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="block"
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              marginLeft: (MASCOT_W - CANVAS_W) / 2,
              marginTop: (MASCOT_H - CANVAS_H) / 2,
            }}
          />
        </div>
      )}
    </>
  );
}
