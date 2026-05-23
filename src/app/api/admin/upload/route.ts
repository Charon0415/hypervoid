import { auth } from "@/auth";
import { isBlobConfigured, uploadImage } from "@/lib/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return Response.json(
      {
        error:
          "Vercel Blob 未配置。在 Vercel Dashboard → Storage 创建一个 Blob 库，它会自动注入 BLOB_READ_WRITE_TOKEN env 变量。",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return Response.json(
      { error: `不支持的文件类型: ${file.type}` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `文件超过 5MB (实际 ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const url = await uploadImage(buffer, file.type);
    return Response.json({ url });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message ?? "Upload failed" },
      { status: 500 },
    );
  }
}
