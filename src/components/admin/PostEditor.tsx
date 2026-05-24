"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

export type PostEditorInitial = {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
  cover: string;
  pinned: boolean;
  status: "draft" | "scheduled" | "published";
  visibility: "public" | "private";
  publishAt: string;
};

const EMPTY: PostEditorInitial = {
  slug: "",
  title: "",
  description: "",
  content: "",
  category: "",
  tags: "",
  cover: "",
  pinned: false,
  status: "draft",
  visibility: "public",
  publishAt: "",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PostEditor({
  mode,
  initial = EMPTY,
  onSubmit,
  onDelete,
}: {
  mode: "new" | "edit";
  initial?: PostEditorInitial;
  onSubmit: (formData: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [state, setState] = useState<PostEditorInitial>(initial);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"cover" | "content" | null>(null);

  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const contentInputRef = useRef<HTMLInputElement | null>(null);

  const update = <K extends keyof PostEditorInitial>(
    key: K,
    value: PostEditorInitial[K],
  ) => setState((s) => ({ ...s, [key]: value }));

  const handleTitleChange = (v: string) => {
    update("title", v);
    if (mode === "new" && !state.slug) {
      update("slug", slugify(v));
    }
  };

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
    return data.url as string;
  }

  const onCoverUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading("cover");
    try {
      const url = await uploadFile(file);
      update("cover", url);
    } catch (e) {
      setError(`上传封面失败：${(e as Error).message}`);
    } finally {
      setUploading(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const onContentImageUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading("content");
    try {
      const url = await uploadFile(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      const snippet = `![${alt}](${url})`;
      const ta = contentRef.current;
      if (ta) {
        const start = ta.selectionStart ?? state.content.length;
        const end = ta.selectionEnd ?? state.content.length;
        const next =
          state.content.slice(0, start) + snippet + state.content.slice(end);
        update("content", next);
        requestAnimationFrame(() => {
          ta.focus();
          const cursor = start + snippet.length;
          ta.setSelectionRange(cursor, cursor);
        });
      } else {
        update("content", state.content + "\n" + snippet);
      }
    } catch (e) {
      setError(`上传图片失败：${(e as Error).message}`);
    } finally {
      setUploading(null);
      if (contentInputRef.current) contentInputRef.current.value = "";
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
    if (!confirm(`确认删除「${state.title}」？此操作不可撤销。`)) return;
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
        <Field label="标题" required>
          <input
            name="title"
            type="text"
            required
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Slug (URL 路径)"
          required
          hint={
            mode === "edit"
              ? "已发布后不建议修改"
              : "纯 ASCII：小写字母、数字、短横线。例：hello-world、why-nextjs"
          }
        >
          <input
            name="slug"
            type="text"
            required
            readOnly={mode === "edit"}
            value={state.slug}
            onChange={(e) =>
              update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            className={`${inputClass} ${mode === "edit" ? "cursor-not-allowed bg-muted/10 text-muted" : ""}`}
            pattern="[a-z0-9][a-z0-9-]*"
          />
        </Field>
      </div>

      <Field label="简介 (用于列表卡片、SEO description)">
        <textarea
          name="description"
          rows={2}
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="分类">
          <input
            name="category"
            type="text"
            value={state.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="标签 (逗号分隔)">
          <input
            name="tags"
            type="text"
            placeholder="Next.js, MDX, 杂谈"
            value={state.tags}
            onChange={(e) => update("tags", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="封面图 URL">
          <div className="flex gap-2">
            <input
              name="cover"
              type="url"
              value={state.cover}
              onChange={(e) => update("cover", e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading !== null}
              className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-primary disabled:opacity-50"
            >
              {uploading === "cover" ? "上传中…" : "上传"}
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="状态">
          <select
            name="status"
            value={state.status}
            onChange={(e) =>
              update(
                "status",
                e.target.value as PostEditorInitial["status"],
              )
            }
            className={inputClass}
          >
            <option value="draft">草稿 (不公开)</option>
            <option value="scheduled">定时 (到点自动公开)</option>
            <option value="published">立即发布</option>
          </select>
        </Field>
        <Field
          label="可见性"
          hint="私密文章只有管理员能在线上看到，公开文章对所有访客可见"
        >
          <select
            name="visibility"
            value={state.visibility}
            onChange={(e) =>
              update(
                "visibility",
                e.target.value as PostEditorInitial["visibility"],
              )
            }
            className={inputClass}
          >
            <option value="public">🌐 公开</option>
            <option value="private">🔒 私密（仅管理员可见）</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {state.status === "scheduled" ? (
          <Field label="定时发布时间" required>
            <input
              name="publishAt"
              type="datetime-local"
              required
              value={state.publishAt}
              onChange={(e) => update("publishAt", e.target.value)}
              className={inputClass}
            />
          </Field>
        ) : (
          <Field label="置顶" hint="勾选后会出现在列表最上方">
            <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <input
                type="checkbox"
                name="pinned"
                checked={state.pinned}
                onChange={(e) => update("pinned", e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span>📌 置顶这篇文章</span>
            </label>
          </Field>
        )}
      </div>

      <Field label="正文 (MDX)" required>
        <div className="flex flex-col gap-2">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => contentInputRef.current?.click()}
              disabled={uploading !== null}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs transition hover:border-primary disabled:opacity-50"
            >
              {uploading === "content" ? "上传中…" : "🖼 插入图片"}
            </button>
            <input
              ref={contentInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                onContentImageUpload(e.currentTarget.files?.[0] ?? null)
              }
            />
          </div>
          <textarea
            ref={contentRef}
            name="content"
            required
            rows={20}
            value={state.content}
            onChange={(e) => update("content", e.target.value)}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>
      </Field>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <Link
            href="/admin/posts"
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
              {deletePending ? "删除中…" : "删除"}
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
