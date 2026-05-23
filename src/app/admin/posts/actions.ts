"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createPost,
  deletePost,
  getPostForEditing,
  updatePost,
  type AdminPostInput,
} from "@/db/admin-posts";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function parseStatus(value: string): AdminPostInput["status"] {
  if (value === "published" || value === "scheduled" || value === "draft") {
    return value;
  }
  return "draft";
}

function parseFormToInput(formData: FormData): {
  slug: string;
  input: Omit<AdminPostInput, "slug">;
} {
  const slug = String(formData.get("slug") ?? "").trim();
  const status = parseStatus(String(formData.get("status") ?? "draft"));
  const publishAtStr = String(formData.get("publishAt") ?? "").trim();
  const tagsStr = String(formData.get("tags") ?? "").trim();
  const tags = tagsStr
    ? tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const publishAt =
    status === "scheduled" && publishAtStr
      ? new Date(publishAtStr)
      : status === "published"
        ? new Date()
        : null;

  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const cover = String(formData.get("cover") ?? "").trim();

  return {
    slug,
    input: {
      title: String(formData.get("title") ?? "").trim() || "Untitled",
      description: description || null,
      content: String(formData.get("content") ?? ""),
      category: category || null,
      tags,
      cover: cover || null,
      status,
      publishAt,
    },
  };
}

export async function createPostAction(formData: FormData) {
  await requireAuth();
  const { slug, input } = parseFormToInput(formData);
  if (!slug) throw new Error("slug is required");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("slug 必须是小写字母、数字、连字符");
  }

  const existing = await getPostForEditing(slug);
  if (existing) {
    throw new Error(`slug "${slug}" 已存在`);
  }

  await createPost({ slug, ...input });
  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect(`/admin/posts/${slug}/edit`);
}

export async function updatePostAction(originalSlug: string, formData: FormData) {
  await requireAuth();
  const { input } = parseFormToInput(formData);

  await updatePost(originalSlug, input);
  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/");
  revalidatePath(`/posts/${originalSlug}`);
  revalidatePath(`/admin/posts/${originalSlug}/edit`);
}

export async function deletePostAction(slug: string) {
  await requireAuth();
  await deletePost(slug);
  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/");
  revalidatePath(`/posts/${slug}`);
  redirect("/admin/posts");
}
