"use client";

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

export function ThemeEditor({
  initial,
}: {
  initial: { enabled: boolean; light: ThemeColors; dark: ThemeColors };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [light, setLight] = useState<Record<ThemeKey, string>>(() => ({
    ...DEFAULT_LIGHT,
    ...initial.light,
  }));
  const [dark, setDark] = useState<Record<ThemeKey, string>>(() => ({
    ...DEFAULT_DARK,
    ...initial.dark,
  }));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [importErr, setImportErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      // Drop empty fields so DB stores partial diffs cleanly
      const lightOut: ThemeColors = {};
      const darkOut: ThemeColors = {};
      for (const k of THEME_KEYS) {
        if (isHex(light[k])) lightOut[k] = normalizeHex(light[k]);
        if (isHex(dark[k])) darkOut[k] = normalizeHex(dark[k]);
      }
      await saveThemeAction({ enabled, light: lightOut, dark: darkOut });
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
    } catch (e) {
      setImportErr(e instanceof Error ? e.message : "导入失败");
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
                关闭时网站使用内置 6 套预设。开启后下面的颜色会通过 CSS
                变量覆盖到所有页面。
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

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">
            JSON 导入 / 导出
          </h3>
          <p className="mt-1 text-xs text-muted">
            把当前配色打包成 JSON 文件保留，或导入别人分享的主题包。
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
          />
          <p className="mt-3 text-[11px] text-muted">
            预览只对这个页面生效。保存后才会写入数据库、应用到全站。
          </p>
        </div>
      </aside>
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
}: {
  mode: "light" | "dark";
  colors: Record<ThemeKey, string>;
}) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-xl border"
      style={{
        background: colors.background,
        color: colors.foreground,
        borderColor: colors.border,
      }}
    >
      <div
        className="border-b px-4 py-3 text-xs"
        style={{ borderColor: colors.border, color: colors.muted }}
      >
        预览（{mode === "light" ? "浅色" : "深色"}）
      </div>
      <div className="p-4">
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
