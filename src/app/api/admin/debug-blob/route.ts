import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const hasToken = Boolean(token);
  const tokenLen = token.length;
  const tokenPrefix = token.slice(0, 22);

  let storeId: string | null = null;
  const match = token.match(/vercel_blob_rw_([A-Za-z0-9]+)_/);
  if (match) storeId = match[1];

  let listStatus: string = "skipped";
  if (hasToken) {
    try {
      const { list } = await import("@vercel/blob");
      const res = await list({ limit: 1 });
      listStatus = `ok (cursor=${res.cursor ?? "none"}, blobs=${res.blobs.length})`;
    } catch (e) {
      listStatus = `error: ${(e as Error).message}`.slice(0, 300);
    }
  }

  return Response.json({
    hasToken,
    tokenLen,
    tokenPrefix,
    storeIdFromToken: storeId,
    listStatus,
  });
}
