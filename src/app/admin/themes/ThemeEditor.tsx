"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  THEME_KEYS,
  type ThemeColors,
  type ThemeKey,
} from "@/lib/custom-theme-shared";
import { saveThemeAction } from "./actions";

const FIELD_LABELS: Record<ThemeKey, string> = {
  background: "背景",
  foreground: "前景文字",
  card: "卡片底色",
  muted: "次要文字",
  border: "边框",
  primary: "主色",
  "primary-foreground": "主色之上文字",
};

const DEFAULT_LIGHT: Record<ThemeKey, string> = {
  background: "#fafafa",
  foreground: "#18181b",
  card: "#ffffff",
  muted: "#71717a",
  border: "#e4e4e7",
  primary: "#1d4ed8",
  "primary-foreground": "#ffffff",
};

const DEFAULT_DARK: Record<ThemeKey, string> = {
  background: "#09090b",
  foreground: "#fafafa",
  card: "#18181b",
  muted: "#a1a1aa",
  border: "#27272a",
  primary: "#3b82f6",
  "primary-foreground": "#ffffff",
};

function normalizeHex(v: string): string {
  return v.toLowerCase().trim();
}

function isHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3,8})$/.test(v.trim());
}

export type ThemeEditorInitial = {
  enabled: boolean;
  light: ThemeColors;
  dark: ThemeColors;
  wallpaperDesktop: string | null;
  wallpaperMobile: string | null;
  wallpaperOpacity: number;
  wallpaperBlur: number;
};

export function ThemeEditor({ initial }: { initial: ThemeEditorInitial }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [light, setLight] = useState<Record<ThemeKey, string>>(() => ({
    ...DEFAULT_LIGHT,
    ...initial.light,
  }));
  const [dark, setDark] = useState<Record<ThemeKey, string>>(() => ({
    ...DEFAULT_DARK,
    ...initial.dark,
  }));
  const [wallpaperDesktop, setWallpaperDesktop] = useState(
    initial.wallpaperDesktop ?? "",
  );
  const [wallpaperMobile, setWallpaperMobile] = useState(
    initial.wallpaperMobile ?? "",
  );
  const [wallpaperOpacity, setWallpaperOpacity] = useState(
    initial.wallpaperOpacity,
  );
  const [wallpaperBlur, setWallpaperBlur] = useState(initial.wallpaperBlur);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [importErr, setImportErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const desktopUploadRef = useRef<HTMLInputElement>(null);
  const mobileUploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(
    null,
  );

  // Inject inline preview styles when "enabled" is toggled. These override
  // the page CSS for THIS admin page only via a scoped <style data-preview>.
  const previewCss = useMemo(() => {
    if (!enabled) return "";
    const lightDecls = Object.entries(light)
      .filter(([, v]) => v)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n");
    const darkDecls = Object.entries(dark)
      .filter(([, v]) => v)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n");
    return `:root {\n${lightDecls}\n}\n.dark {\n${darkDecls}\n}\n`;
  }, [enabled, light, dark]);

  useEffect(() => {
    const id = "admin-theme-preview";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = previewCss;
    return () => {
      if (el?.parentNode) el.parentNode.removeChild(el);
    };
  }, [previewCss]);

  const onChange = (
    mode: "light" | "dark",
    key: ThemeKey,
    value: string,
  ) => {
    if (mode === "light") {
      setLight((prev) => ({ ...prev, [key]: value }));
    } else {
      setDark((prev) => ({ ...prev, [key]: value }));
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const lightOut: ThemeColors = {};
      const darkOut: ThemeColors = {};
      for (const k of THEME_KEYS) {
        if (isHex(light[k])) lightOut[k] = normalizeHex(light[k]);
        if (isHex(dark[k])) darkOut[k] = normalizeHex(dark[k]);
      }
      await saveThemeAction({
        enabled,
        light: lightOut,
        dark: darkOut,
        wallpaperDesktop: wallpaperDesktop.trim() || null,
        wallpaperMobile: wallpaperMobile.trim() || null,
        wallpaperOpacity: Math.max(0, Math.min(100, wallpaperOpacity)),
        wallpaperBlur: Math.max(0, Math.min(20, wallpaperBlur)),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    setLight({ ...DEFAULT_LIGHT });
    setDark({ ...DEFAULT_DARK });
  };

  const onExport = () => {
    const payload = {
      name: "Hypervoid Custom Theme",
      exportedAt: new Date().toISOString(),
      enabled,
      light,
      dark,
      wallpaperDesktop: wallpaperDesktop || null,
      wallpaperMobile: wallpaperMobile || null,
      wallpaperOpacity,
      wallpaperBlur,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hypervoid-theme-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    setImportErr(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (typeof data !== "object" || data === null) {
        throw new Error("非法 JSON 结构");
      }
      const newLight = { ...DEFAULT_LIGHT };
      const newDark = { ...DEFAULT_DARK };
      if (data.light && typeof data.light === "object") {
        for (const k of THEME_KEYS) {
          if (typeof data.light[k] === "string" && isHex(data.light[k])) {
            newLight[k] = normalizeHex(data.light[k]);
          }
        }
      }
      if (data.dark && typeof data.dark === "object") {
        for (const k of THEME_KEYS) {
          if (typeof data.dark[k] === "string" && isHex(data.dark[k])) {
            newDark[k] = normalizeHex(data.dark[k]);
          }
        }
      }
      setLight(newLight);
      setDark(newDark);
      if (typeof data.enabled === "boolean") setEnabled(data.enabled);
      if (typeof data.wallpaperDesktop === "string")
        setWallpaperDesktop(data.wallpaperDesktop);
      if (typeof data.wallpaperMobile === "string")
        setWallpaperMobile(data.wallpaperMobile);
      if (typeof data.wallpaperOpacity === "number")
        setWallpaperOpacity(data.wallpaperOpacity);
      if (typeof data.wallpaperBlur === "number")
        setWallpaperBlur(data.wallpaperBlur);
    } catch (e) {
      setImportErr(e instanceof Error ? e.message : "导入失败");
    }
  };

  const uploadWallpaper = async (file: File, target: "desktop" | "mobile") => {
    setUploading(target);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        alert(json.error ?? "上传失败");
        return;
      }
      if (target === "desktop") setWallpaperDesktop(json.url);
      else setWallpaperMobile(json.url);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-medium">启用自定义主题</span>
              <span className="block text-xs text-muted">
                关闭时网站使用内置预设。开启后下面的颜色 + 壁纸会通过 CSS
                变量与背景图覆盖到所有页面。
              </span>
            </span>
          </label>
        </section>

        <ColorGrid
          title="浅色模式"
          mode="light"
          values={light}
          defaults={DEFAULT_LIGHT}
          onChange={onChange}
        />

        <ColorGrid
          title="深色模式"
          mode="dark"
          values={dark}
          defaults={DEFAULT_DARK}
          onChange={onChange}
        />

        {/* Wallpaper section */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">
            背景壁纸 · 桌面端 / 移动端
          </h3>
          <p className="mt-1 text-xs text-muted">
            桌面与移动端可分开配置——比如桌面用宽幅 16:9
            的风景，移动端用更适合竖屏的图。两者都可留空走默认背景。
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <WallpaperField
              label="桌面端 (≥768px)"
              hint="推荐 1920×1080 以上的横向图"
              value={wallpaperDesktop}
              onChange={setWallpaperDesktop}
              onUploadClick={() => desktopUploadRef.current?.click()}
              uploading={uploading === "desktop"}
              fileRef={desktopUploadRef}
              onFile={(f) => uploadWallpaper(f, "desktop")}
            />
            <WallpaperField
              label="移动端 (<768px)"
              hint="推荐 1080×1920 左右的竖向图"
              value={wallpaperMobile}
              onChange={setWallpaperMobile}
              onUploadClick={() => mobileUploadRef.current?.click()}
              uploading={uploading === "mobile"}
              fileRef={mobileUploadRef}
              onFile={(f) => uploadWallpaper(f, "mobile")}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="flex items-baseline justify-between text-xs">
                <span className="font-medium">不透明度</span>
                <span className="font-mono text-muted">
                  {wallpaperOpacity}%
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={wallpaperOpacity}
                onChange={(e) => setWallpaperOpacity(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="text-[11px] text-muted/80">
                越低越淡。100% 完全显示。
              </span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="flex items-baseline justify-between text-xs">
                <span className="font-medium">模糊</span>
                <span className="font-mono text-muted">
                  {wallpaperBlur}px
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={20}
                value={wallpaperBlur}
                onChange={(e) => setWallpaperBlur(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="text-[11px] text-muted/80">
                高于 0 时为壁纸添加 backdrop blur，避免抢戏正文。
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">
            JSON 导入 / 导出
          </h3>
          <p className="mt-1 text-xs text-muted">
            把当前配色 + 壁纸打包成 JSON 文件保留，或导入别人分享的主题包。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExport}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
            >
              导出 JSON
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
            >
              导入 JSON…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted transition hover:border-amber-500 hover:text-amber-600"
            >
              恢复默认配色
            </button>
          </div>
          {importErr ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              导入错误：{importErr}
            </p>
          ) : null}
        </section>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存到数据库"}
          </button>
          {savedAt ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              已保存 ✓ {new Date(savedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      {/* Sticky preview panel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight">实时预览</h3>
            <div className="flex rounded-md border border-border bg-background p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setPreviewMode("light")}
                className={`rounded px-2 py-0.5 transition ${
                  previewMode === "light"
                    ? "bg-card font-medium"
                    : "text-muted"
                }`}
              >
                浅色
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("dark")}
                className={`rounded px-2 py-0.5 transition ${
                  previewMode === "dark"
                    ? "bg-card font-medium"
                    : "text-muted"
                }`}
              >
                深色
              </button>
            </div>
          </div>
          <PreviewSurface
            mode={previewMode}
            colors={previewMode === "light" ? light : dark}
            wallpaper={wallpaperDesktop || null}
            opacity={wallpaperOpacity}
            blur={wallpaperBlur}
          />
          <p className="mt-3 text-[11px] text-muted">
            预览只对这个页面生效。保存后才会写入数据库、应用到全站。
          </p>
        </div>
      </aside>
    </div>
  );
}

function WallpaperField({
  label,
  hint,
  value,
  onChange,
  onUploadClick,
  uploading,
  fileRef,
  onFile,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  onUploadClick: () => void;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="font-mono text-[10px] text-muted hover:text-red-500"
          >
            清空
          </button>
        ) : null}
      </span>
      {value ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-background">
          <Image
            src={value}
            alt=""
            width={640}
            height={360}
            sizes="320px"
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-background text-xs text-muted">
          未设置壁纸
        </div>
      )}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://...  或留空"
        className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] transition focus:border-primary focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUploadClick}
          disabled={uploading}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] transition hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {uploading ? "上传中…" : "上传图片"}
        </button>
        <span className="text-[11px] text-muted">{hint}</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ColorGrid({
  title,
  mode,
  values,
  defaults,
  onChange,
}: {
  title: string;
  mode: "light" | "dark";
  values: Record<ThemeKey, string>;
  defaults: Record<ThemeKey, string>;
  onChange: (mode: "light" | "dark", key: ThemeKey, value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {THEME_KEYS.map((key) => {
          const val = values[key] ?? "";
          const isDirty = val.toLowerCase() !== defaults[key].toLowerCase();
          return (
            <div key={key} className="flex items-center gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="flex items-baseline gap-1 text-xs">
                  <span className="font-medium">{FIELD_LABELS[key]}</span>
                  <code className="font-mono text-[10px] text-muted">
                    --{key}
                  </code>
                  {isDirty ? (
                    <span className="text-[10px] text-primary">·已改</span>
                  ) : null}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isHex(val) ? val.slice(0, 7) : defaults[key]}
                    onChange={(e) => onChange(mode, key, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-border bg-card"
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChange(mode, key, e.target.value)}
                    placeholder={defaults[key]}
                    className={`flex-1 rounded-md border bg-background px-2 py-1 font-mono text-xs ${
                      isHex(val)
                        ? "border-border"
                        : "border-amber-500/60 text-amber-700 dark:text-amber-300"
                    }`}
                  />
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PreviewSurface({
  mode,
  colors,
  wallpaper,
  opacity,
  blur,
}: {
  mode: "light" | "dark";
  colors: Record<ThemeKey, string>;
  wallpaper: string | null;
  opacity: number;
  blur: number;
}) {
  return (
    <div
      className="relative mt-3 overflow-hidden rounded-xl border"
      style={{
        background: colors.background,
        color: colors.foreground,
        borderColor: colors.border,
      }}
    >
      {wallpaper ? (
        <Image
          src={wallpaper}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: opacity / 100,
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
          }}
        />
      ) : null}
      <div
        className="relative border-b px-4 py-3 text-xs"
        style={{ borderColor: colors.border, color: colors.muted }}
      >
        预览（{mode === "light" ? "浅色" : "深色"}）
      </div>
      <div className="relative p-4">
        <div
          className="rounded-lg border p-4"
          style={{
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          <h4 className="text-base font-bold">示例文章标题</h4>
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            这一段是次要文字 — 描述、摘要、元信息会用这个色。
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1 text-xs font-medium"
              style={{
                background: colors.primary,
                color: colors["primary-foreground"],
              }}
            >
              主按钮
            </button>
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-xs"
              style={{
                borderColor: colors.border,
                color: colors.foreground,
              }}
            >
              次按钮
            </button>
            <span
              className="ml-auto font-mono text-[10px]"
              style={{ color: colors.muted }}
            >
              #1234
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
