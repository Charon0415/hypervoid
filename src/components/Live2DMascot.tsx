"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const STORAGE_KEY = "hypervoid:mascot";
const STORAGE_DISABLED_KEY = "hypervoid:mascot-disabled";
const DEFAULT_MODEL = "/live2d/haru01/haru01.model.json";

const MESSAGES: Record<string, string[]> = {
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
};

type Position = { x: number; y: number };

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function isMascotEnabled(): boolean {
  if (typeof window === "undefined" || isMobile()) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return raw === "true";
    return isAcgBackground();
  } catch {
    return false;
  }
}

function isAcgBackground(): boolean {
  try {
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
  } catch { /* noop */ }
}

export function Live2DMascot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<Position>({ x: -1, y: -1 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const dialogTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const appRef = useRef<unknown>(null);

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<"hidden" | "visible">("hidden");
  const [dialog, setDialog] = useState<string | null>(null);

  // Set initial state after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    if (isMascotEnabled()) setState("visible");
  }, []);

  const show = useCallback(() => {
    setMascotEnabled(true);
    setState("visible");
  }, []);

  const close = useCallback(() => {
    setMascotEnabled(false);
    setState("hidden");
  }, []);

  const showDialog = useCallback((msg: string) => {
    setDialog(msg);
    if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
    dialogTimerRef.current = setTimeout(() => setDialog(null), 3500);
  }, []);

  // Listen for external toggle events
  useEffect(() => {
    const handler = (e: Event) => {
      const enabled = (e as CustomEvent<boolean>).detail;
      setState(enabled ? "visible" : "hidden");
    };
    window.addEventListener("hypervoid:mascot-changed", handler);
    return () =>
      window.removeEventListener("hypervoid:mascot-changed", handler);
  }, []);

  // Init PIXI + Live2D
  useEffect(() => {
    if (state === "hidden") return;
    let disposed = false;

    (async () => {
      try {
        const [{ Application }, { Live2DModel }] = await Promise.all([
          import("pixi.js"),
          import("pixi-live2d-display"),
        ]);

        if (disposed || !canvasRef.current) return;

        const width = 200;
        const height = 250;

        const app = new Application({
          view: canvasRef.current,
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        appRef.current = app;

        try {
          const model = await Live2DModel.from(DEFAULT_MODEL);

          const scale =
            Math.min(width / model.width, height / model.height) * 0.85;
          model.scale.set(scale);
          model.x = width / 2;
          model.y = height * 0.55;
          model.anchor.set(0.5, 0.5);

          model.on("hit", () => {
            const msgs = MESSAGES.tap;
            showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
          });

          app.stage.addChild(model);

          const scheduleIdle = () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => {
              if (disposed) return;
              const msgs = MESSAGES.idle;
              showDialog(msgs[Math.floor(Math.random() * msgs.length)]);
              scheduleIdle();
            }, 30000 + Math.random() * 60000);
          };
          scheduleIdle();
        } catch {
          showDialog("找不到模型文件");
        }
      } catch (e) {
        console.warn("[mascot] init failed:", e);
      }
    })();

    return () => {
      disposed = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
      try {
        const app = appRef.current as {
          destroy?: (removeView: boolean, stageOptions: unknown) => void;
        } | null;
        app?.destroy?.(true, { children: true, texture: true });
      } catch { /* noop */ }
    };
  }, [state, showDialog]);

  // Dragging
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement)?.tagName === "CANVAS") {
      draggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - posRef.current.x,
        y: e.clientY - posRef.current.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    posRef.current = { x, y };
    if (containerRef.current) {
      containerRef.current.style.left = `${x}px`;
      containerRef.current.style.top = `${y}px`;
      containerRef.current.style.right = "auto";
      containerRef.current.style.bottom = "auto";
    }
  }, []);

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const setDefaultPosition = useCallback(() => {
    if (!containerRef.current || posRef.current.x >= 0) return;
    const w = 220;
    const h = 260;
    const x = window.innerWidth - w - 16;
    const y = window.innerHeight - h - 16;
    posRef.current = { x, y };
    containerRef.current.style.right = "auto";
    containerRef.current.style.bottom = "auto";
    containerRef.current.style.left = `${x}px`;
    containerRef.current.style.top = `${y}px`;
  }, []);

  useEffect(() => {
    if (state === "visible") {
      setDefaultPosition();
      window.addEventListener("resize", setDefaultPosition);
      return () => window.removeEventListener("resize", setDefaultPosition);
    }
  }, [state, setDefaultPosition]);

  // Don't render anything on mobile or before hydration
  if (!mounted) return null;

  return (
    <>
      {/* Floating toggle — visible when mascot is off */}
      {state === "hidden" && (
        <button
          type="button"
          onClick={show}
          className="fixed bottom-4 right-4 z-[998] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-lg shadow-lg backdrop-blur transition hover:border-primary hover:shadow-xl"
          aria-label="开启看板娘"
          title="看板娘"
        >
          <svg
            className="h-5 w-5 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="10" r="3" />
            <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
          </svg>
        </button>
      )}

      {/* Mascot */}
      {state === "visible" && (
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="fixed z-[999] select-none touch-none"
          style={{
            left:
              posRef.current.x >= 0 ? posRef.current.x : undefined,
            top: posRef.current.y >= 0 ? posRef.current.y : undefined,
            right: posRef.current.x < 0 ? 16 : undefined,
            bottom: posRef.current.y < 0 ? 16 : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute -top-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs text-muted opacity-0 transition-opacity hover:opacity-100 hover:text-foreground"
            aria-label="关闭看板娘"
          >
            ×
          </button>

          {/* Dialog bubble */}
          {dialog && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 max-w-[180px] animate-in fade-in slide-in-from-bottom-1 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg">
              {dialog}
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="block cursor-grab active:cursor-grabbing"
            style={{ width: 200, height: 250 }}
          />
        </div>
      )}
    </>
  );
}
