"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Check,
  Download,
  MonitorCog,
  RotateCcw,
  Settings2,
  Type,
  X,
} from "lucide-react";
import {
  DISPLAY_MODE_OPTIONS,
  FONT_SIZE_OPTIONS,
  useSettings,
} from "@/components/SettingsProvider";
import { isMascotEnabled, setMascotEnabled } from "@/components/Live2DMascot";
import { useInstallPrompt } from "@/components/PwaInstallController";

const MASCOT_ENABLED_KEY = "hypervoid:mascot";
const MASCOT_ENABLED_EVENT = "hypervoid:mascot-changed";

function SettingSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-cyan-100/14 bg-white/[0.035] p-3">
      <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase text-cyan-50/68">
        <span className="grid h-6 w-6 place-items-center border border-cyan-100/18 bg-cyan-50/8 text-cyan-100">
          {icon}
        </span>
        {title}
      </div>
      {children}
    </section>
  );
}

export function SiteSettings({
  triggerClassName,
  triggerChildren,
}: {
  triggerClassName?: string;
  triggerChildren?: ReactNode;
} = {}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mascot, setMascot] = useState(false);
  const { available: installAvailable, install } = useInstallPrompt();
  const { fontSize, displayMode, setFontSize, setDisplayMode, reset } = useSettings();

  useEffect(() => {
    setMounted(true);
    setMascot(isMascotEnabled());
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    const syncMascotEnabled = () => setMascot(isMascotEnabled());
    const onMascotChanged = (e: Event) => {
      const enabled = (e as CustomEvent<boolean>).detail;
      setMascot(typeof enabled === "boolean" ? enabled : isMascotEnabled());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === MASCOT_ENABLED_KEY) syncMascotEnabled();
    };
    window.addEventListener(MASCOT_ENABLED_EVENT, onMascotChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      mql.removeEventListener("change", sync);
      window.removeEventListener(MASCOT_ENABLED_EVENT, onMascotChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const optionBase =
    "relative flex min-h-11 items-center justify-between gap-3 border px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70";
  const active = "border-cyan-100/48 bg-cyan-50/12 text-white shadow-[0_0_22px_rgba(34,211,238,0.12)]";
  const idle = "border-cyan-100/14 bg-black/16 text-cyan-50/68 hover:border-cyan-100/34 hover:bg-cyan-50/8 hover:text-white";

  const panel = open ? (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <div
        role="dialog"
        aria-label="界面控制"
        className="fixed inset-x-3 bottom-3 z-50 max-h-[86dvh] overflow-y-auto border border-cyan-100/20 bg-slate-950/88 text-white shadow-[0_28px_90px_rgba(0,0,0,0.46),0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-2xl md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-12 md:w-[21rem]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-cyan-100/14 bg-slate-950/82 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase text-cyan-100/70">Interface Console</p>
              <h2 className="mt-1 text-base font-black tracking-normal text-white">界面控制</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={reset}
                aria-label="重置界面控制"
                title="重置"
                className="grid h-9 w-9 place-items-center border border-cyan-100/14 text-cyan-50/64 transition hover:border-cyan-100/38 hover:bg-cyan-50/8 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭界面控制"
                className="grid h-9 w-9 place-items-center border border-cyan-100/14 text-cyan-50/64 transition hover:border-cyan-100/38 hover:bg-cyan-50/8 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70 md:hidden"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-cyan-50/50">
            旧色相、壁纸市场与字体预设已移除；右上角可快速切换主题与背景。
          </p>
        </div>

        <div className="grid gap-3 p-4">
          <SettingSection icon={<MonitorCog className="h-3.5 w-3.5" aria-hidden />} title="视觉层级">
            <div className="grid gap-2">
              {DISPLAY_MODE_OPTIONS.map((o) => {
                const isActive = displayMode === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setDisplayMode(o.key)}
                    aria-pressed={isActive}
                    title={o.hint}
                    className={[optionBase, isActive ? active : idle].join(" ")}
                  >
                    <span>
                      <span className="block font-semibold">{o.label}</span>
                      <span className="mt-0.5 block text-xs text-cyan-50/48">{o.hint}</span>
                    </span>
                    {isActive ? <Check className="h-4 w-4 shrink-0 text-cyan-100" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </SettingSection>

          <SettingSection icon={<Type className="h-3.5 w-3.5" aria-hidden />} title="阅读字号">
            <div className="grid grid-cols-2 gap-2">
              {FONT_SIZE_OPTIONS.map((o) => {
                const isActive = fontSize === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setFontSize(o.key)}
                    aria-pressed={isActive}
                    title={o.hint}
                    className={[optionBase, "flex-col items-start justify-center", isActive ? active : idle].join(" ")}
                  >
                    <span className="font-semibold">{o.label}</span>
                    <span className="text-xs text-cyan-50/48">{o.hint}</span>
                  </button>
                );
              })}
            </div>
          </SettingSection>

          {!isMobile ? (
            <SettingSection icon={<Bot className="h-3.5 w-3.5" aria-hidden />} title="看板娘">
              <button
                type="button"
                onClick={() => {
                  const nextMascot = !mascot;
                  setMascot(nextMascot);
                  setMascotEnabled(nextMascot);
                }}
                aria-pressed={mascot}
                className={[optionBase, "w-full", mascot ? active : idle].join(" ")}
              >
                <span>
                  <span className="block font-semibold">{mascot ? "已开启" : "已关闭"}</span>
                  <span className="mt-0.5 block text-xs text-cyan-50/48">右下角交互角色，仅桌面显示。</span>
                </span>
                <span
                  aria-hidden
                  className={["relative h-5 w-9 border transition", mascot ? "border-cyan-100 bg-cyan-100" : "border-cyan-100/18 bg-white/5"].join(" ")}
                >
                  <span className={["absolute top-0.5 h-3.5 w-3.5 bg-slate-950 transition-transform", mascot ? "translate-x-[1.125rem]" : "translate-x-0.5"].join(" ")} />
                </span>
              </button>
            </SettingSection>
          ) : null}

          {installAvailable ? (
            <SettingSection icon={<Download className="h-3.5 w-3.5" aria-hidden />} title="安装">
              <button type="button" onClick={install} className={[optionBase, "w-full", idle].join(" ")}>
                <span>
                  <span className="block font-semibold">安装 Hypervoid</span>
                  <span className="mt-0.5 block text-xs text-cyan-50/48">添加到桌面或主屏，使用离线缓存。</span>
                </span>
                <Download className="h-4 w-4 shrink-0 text-cyan-100" aria-hidden />
              </button>
            </SettingSection>
          ) : null}

          <p className="hidden border-t border-cyan-100/12 pt-3 font-mono text-[10px] uppercase text-cyan-50/38 md:block">
            Cmd/Ctrl + , open · Esc close
          </p>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="界面控制"
        aria-expanded={open}
        title="界面控制 (Cmd/Ctrl+,)"
        className={triggerClassName ?? "grid h-10 w-10 place-items-center border border-cyan-100/18 bg-white/[0.055] text-cyan-50/72 backdrop-blur-xl transition hover:border-cyan-100/45 hover:bg-cyan-50/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70"}
      >
        {triggerChildren ?? <Settings2 className="h-4 w-4" aria-hidden />}
      </button>
      {mounted && isMobile && panel ? createPortal(panel, document.body) : panel}
    </div>
  );
}
