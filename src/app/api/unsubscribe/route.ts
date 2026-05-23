import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    redirect("/subscribe/result?status=missing");
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.subscribers)
    .where(eq(schema.subscribers.unsubscribeToken, token))
    .limit(1);

  const row = rows[0];
  if (!row) {
    redirect("/subscribe/result?status=invalid");
  }

  await db
    .update(schema.subscribers)
    .set({ unsubscribedAt: new Date(), verified: false })
    .where(eq(schema.subscribers.id, row.id));

  redirect("/subscribe/result?status=unsubscribed");
}
