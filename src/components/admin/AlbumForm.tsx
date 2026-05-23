"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

export type AlbumFormInitial = {
  slug: string;
  name: string;
  description: string;
  coverUrl: string;
  sortOrder: string;
};

const EMPTY: AlbumFormInitial = {
  slug: "",
  name: "",
  description: "",
  coverUrl: "",
  sortOrder: "0",
};

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition focus:border-primary focus:outline-none";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function AlbumForm({
  mode,
  initial = EMPTY,
  onSubmit,
  onDelete,
}: {
  mode: "new" | "edit";
  initial?: AlbumFormInitial;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [state, setState] = useState<AlbumFormInitial>(initial);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof AlbumFormInitial>(
    key: K,
    value: AlbumFormInitial[K],
  ) => setState((s) => ({ ...s, [key]: value }));

  const onCoverUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
      update("coverUrl", data.url as string);
    } catch (e) {
      setError(`封面上传失败：${(e as Error).message}`);
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(formData);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (
      !confirm(`删除相册「${state.name}」？里面的所有照片会一并删除。`)
    )
      return;
    startDeleteTransition(async () => {
      try {
        await onDelete();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <div className="rounded-md border border-red-400/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="名字" required>
          <input
            name="name"
            type="text"
            required
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Slug" required hint="URL 路径，例：tokyo-2024">
          <input
            name="slug"
            type="text"
            required
            readOnly={mode === "edit"}
            value={state.slug}
            onChange={(e) =>
              update(
                "slug",
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              )
            }
            pattern="[a-z0-9][a-z0-9-]*"
            className={`${inputClass} ${mode === "edit" ? "cursor-not-allowed bg-muted/10 text-muted" : ""}`}
          />
        </Field>
      </div>

      <Field label="描述">
        <textarea
          name="description"
          rows={2}
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="封面图 URL" hint="支持上传到 Vercel Blob">
        <div className="flex gap-2">
          <input
            name="coverUrl"
            type="url"
            value={state.coverUrl}
            onChange={(e) => update("coverUrl", e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-primary disabled:opacity-50"
          >
            {uploading ? "上传中…" : "上传"}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              onCoverUpload(e.currentTarget.files?.[0] ?? null)
            }
          />
        </div>
      </Field>

      <Field label="排序" hint="数字越小越靠前">
        <input
          name="sortOrder"
          type="number"
          value={state.sortOrder}
          onChange={(e) => update("sortOrder", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <Link
            href="/admin/albums"
            className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:border-primary"
          >
            取消
          </Link>
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              className="rounded-md border border-red-400/50 bg-red-50 px-4 py-2 text-sm text-red-700 hover:border-red-500 disabled:opacity-50 dark:bg-red-950 dark:text-red-200"
            >
              {deletePending ? "删除中…" : "删除相册"}
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "保存中…" : mode === "new" ? "创建" : "保存"}
        </button>
      </div>
    </form>
  );
}
