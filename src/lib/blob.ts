import "server-only";

import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const EXT_FROM_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadImage(
  body: Buffer,
  contentType: string,
): Promise<string> {
  const ext = EXT_FROM_MIME[contentType.toLowerCase()] ?? "bin";
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const key = `images/${yyyy}/${mm}/${randomUUID()}.${ext}`;

  const result = await put(key, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    cacheControlMaxAge: 31536000,
  });

  return result.url;
}
