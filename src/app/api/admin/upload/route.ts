import { auth } from "@/auth";
import { isR2Configured, uploadImage } from "@/lib/r2";

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

  if (!isR2Configured()) {
    return Response.json(
      {
        error:
          "R2 凭据未配置。请在 Vercel 环境变量中添加 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_BASE_URL。",
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
